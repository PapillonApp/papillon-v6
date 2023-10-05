import {
  TokenResponse,
  AuthRequest,
  exchangeCodeAsync,
  resolveDiscoveryAsync,
  revokeAsync,
} from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deserialize } from 'jsonapi-fractal';
import jwtDecode from 'jwt-decode';
import { Alert } from 'react-native';
import { encode as btoa } from 'base-64';
import { coolDownAsync, warmUpAsync } from 'expo-web-browser';
import { showMessage } from 'react-native-flash-message';
import { SkolengoBase } from './SkolengoBase';
import { SkolengoCache } from './SkolengoCache';
import { SkolengoStatic } from './SkolengoLoginFlow';

export class SkolengoDatas extends SkolengoBase {
  /**
   * @param {Date} date
   */
  static parseDate = (date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  static TOKEN_PATH = 'sko-token';

  static SCHOOL_PATH = 'sko-school';

  static CURRENT_USER_PATH = 'sko-current-user';

  static DISCOVERY_PATH = 'sko-discovery';

  static BASE_URL = 'https://api.skolengo.com/api/v1/bff-sko-app';

  /**
   * @type {Promise<import('scolengo-api/types/models/School').School>}
   */
  school;

  /**
   * @type {TokenResponse}
   */
  rtInstance;

  /**
   * @type {{
   *   sub: string
   *   oauthClientId: string
   *   clientName: string
   *   roles: any[]
   *   iss: string
   *   client_id: string
   *   grant_type: string
   *   permissions: any[]
   *   scope: string
   *   serverIpAddress: string
   *   longTermAuthenticationRequestTokenUsed: boolean
   *   state: string
   *   exp: number
   *   iat: number
   *   jti: string
   *   email: string
   *   clientIpAddress: string
   *   isFromNewLogin: boolean
   *   authenticationDate: string
   *   successfulAuthenticationHandlers: string
   *   profile: string
   *   userAgent: string
   *   given_name: string
   *   nonce: string
   *   credentialType: string
   *   aud: string
   *   authenticationMethod: string
   *   geoLocation: string
   *   scopes: string
   *   family_name: string
   * }}
   */
  currentUser;

  /**
   * @type {boolean}
   *
   * @memberof SkolengoDatas
   */
  retry;

  saveToken = (discovery = false) =>
    Promise.all([
      AsyncStorage.setItem(
        SkolengoDatas.TOKEN_PATH,
        JSON.stringify(this.rtInstance)
      ),
      AsyncStorage.setItem(
        SkolengoDatas.SCHOOL_PATH,
        JSON.stringify(this.school)
      ),
      AsyncStorage.setItem(
        SkolengoDatas.CURRENT_USER_PATH,
        JSON.stringify(this.currentUser)
      ),
      discovery &&
        AsyncStorage.setItem(
          SkolengoDatas.DISCOVERY_PATH,
          JSON.stringify(discovery)
        ),
    ])
      .then(() => console.log('token-saved'))
      .then(() => this);

  static initSkolengoDatas = async () => {
    const [rtInstance, school, currentUser] = await Promise.all([
      AsyncStorage.getItem(SkolengoDatas.TOKEN_PATH)
        .then((_token) => JSON.parse(_token))
        .then((token) => new TokenResponse(token)),
      AsyncStorage.getItem(SkolengoDatas.SCHOOL_PATH).then((_school) =>
        JSON.parse(_school)
      ),
      AsyncStorage.getItem(SkolengoDatas.CURRENT_USER_PATH).then(
        (_currentUser) => JSON.parse(_currentUser)
      ),
    ]);
    return new SkolengoDatas(rtInstance, school, currentUser);
  };

  /**
   * @param {TokenResponse} rtInstance
   * @param {import('scolengo-api/types/models/School').School} school
   */
  constructor(rtInstance, school) {
    super();
    this.rtInstance = rtInstance;
    this.school = school;
    this.currentUserGenerate();
    this.retry = false;
  }

  /**
   * @param {'get' | 'post' | 'put' | 'delete'} method 'get' | 'post' | 'put' | 'delete'
   * @param {string} url URL of the api route without baseurl
   * @param {Record<string, string|number|Record<string, string|number>>} params Query params
   * @param {Record<string,any>|null} body Body of the request
   * @param {"json"|"stream"} [responseType='json'] Response type (optional)
   * @returns {Promise<any>}
   */
  request = async (
    method,
    url,
    params = {},
    body = null,
    responseType = 'json',
    retry = false,
    dser = true
  ) => {
    let errStatus;
    try {
      const fetchOpt = {
        method,
        credentials: 'include',
        body: body ? JSON.stringify(body) : null,
        headers: {
          Authorization: `Bearer ${this.rtInstance.accessToken}`,
          'X-Skolengo-Date-Format': 'utc',
          'X-Skolengo-School-Id': this.school.id,
          'X-Skolengo-Ems-Code': this.school.emsCode,
        },
      };
      const fetchUrl = `${
        SkolengoDatas.BASE_URL
      }${url}${SkolengoDatas.searchParamsSerialiser(params)}`;
      const res = await fetch(fetchUrl, fetchOpt);
      if (res.status === 401 && retry) {
        Alert.alert(
          'Erreur de connexion',
          'Veuillez vous reconnecter à votre compte Skolengo',
          [
            {
              text: 'OK',
              onPress: async () => {
                const inst = await loginSkolengoWorkflow(
                  null,
                  null,
                  this.school,
                  this
                );
                this.rtInstance = inst.rtInstance;
                this.saveToken();
              },
            },
          ],
          { cancelable: false }
        );
      }
      if (!res.ok || res.status >= 400) {
        console.log('error', res.status, res.statusText);
        console.log('error.body', await res.text());
        errStatus = res.status;
        throw new Error(`Error ${res.status} : ${res.statusText}`);
      }
      if (responseType === 'stream') return res.body;
      const txt = await res.text();
      const json = JSON.parse(txt);
      if (dser) return deserialize(json);
      return json;
    } catch (e) {
      if (!retry && errStatus === 401) {
        await this.retrying(e);
        return this.request(method, url, params, body, responseType, true);
      }
      console.log('retry failed', e.message, e);
    }
  };

  async retrying(e) {
    if (this.retry === false) {
      // Après des tests, le refreshAsync de Expo-Auth-Session ne semble pas fonctionné avec les CAS Skolengo.
      this.retry = true;
      console.log('retry', e);
      console.log(e?.message);
      const disco = await AsyncStorage.getItem(
        SkolengoDatas.DISCOVERY_PATH
      ).then((_discovery) => JSON.parse(_discovery));
      const url = `${disco.tokenEndpoint}?grant_type=refresh_token&refresh_token=${this.rtInstance.refreshToken}`;
      const auth = `Basic ${btoa(
        `${SkolengoBase.OID_CLIENT_ID}:${SkolengoBase.OID_CLIENT_SECRET}`
      )}`;
      const newToken = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          Authorization: auth,
        },
      })
        .catch((_e) => {
          console.log('refresh error', _e);
          console.log(_e.response);
        })
        .then(async (res) => res.json());
      const newRtInstance = new TokenResponse({
        accessToken: newToken.access_token || this.rtInstance.accessToken,
        idToken: newToken.id_token || this.rtInstance.idToken,
        refreshToken: newToken.refresh_token || this.rtInstance.refreshToken,
        expiresIn: newToken.expires_in || this.rtInstance.expiresIn,
        scope: newToken.scope || this.rtInstance.scope,
        tokenType: newToken.token_type || this.rtInstance.tokenType,
      });
      this.rtInstance = newRtInstance;
      this.currentUserGenerate();
      await this.saveToken();
      this.retry = false;
    } else {
      return new Promise((resolve) => {
        // interval checking
        const interval = setInterval(() => {
          if (this.retry === false) {
            clearInterval(interval);
            resolve();
          }
        }, 1000);
      });
    }
  }

  currentUserGenerate = () => {
    // Convertion du JWT en JSON (en e/ppant les caractères spéciaux)
    this.currentUser = jwtDecode(this.rtInstance.accessToken);
  };

  getUser = async (force = false) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.userdatas
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const datas = await this.request(
      'get',
      `/users-info/${this.currentUser.sub}`,
      {
        include: 'school,students,students.school',
      }
    ).then(this.usrTransform);
    SkolengoCache.setItem(
      SkolengoCache.cacheKeys.userdatas,
      datas,
      SkolengoCache.DAY
    );
    return datas;
  };

  /**
   * @returns {Promise<import('scolengo-api/types/models/SchoolLife').AbsenceFile[]>}
   */
  getAbsenceFiles = async (force = false, limit = 20, offset = 0) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.absences
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }

    const datas = await this.request('get', '/absence-files', {
      filter: {
        'student.id': this.currentUser.sub,
        'currentState.absenceType': 'ABSENCE,LATENESS',
      },
      include:
        'currentState,currentState.absenceReason,currentState.absenceRecurrence',
      fields: {
        absenceFile: 'currentState',
        absenceFileState:
          'creationDateTime,absenceStartDateTime,absenceEndDateTime,absenceType,absenceFileStatus,absenceReason,absenceRecurrence',
        absenceReason: 'code,longLabel',
        absenceRecurrence: '',
      },
      page: {
        limit,
        offset,
      },
    }).then(async (e) =>
      e.length < limit
        ? e
        : this.getAbsenceFiles(force, limit, offset + limit).then((f) =>
            e.concat(f)
          )
    );
    SkolengoCache.setItem(
      SkolengoCache.cacheKeys.absences,
      datas,
      SkolengoCache.HOUR * 4
    );
    return datas;
  };

  /**
   * @returns {Promise<import('scolengo-api/types/models/SchoolLife').AbsenceFile>}
   */
  getAbsenceFile = async (absenceFileId) =>
    this.request('get', `/absence-files/${absenceFileId}`, {
      include: 'currentState',
      filter: {
        'student.id': this.currentUser.sub,
        'currentState.absenceType': 'ABSENCE,LATENESS,DEPARTURE,EXEMPTION',
      },
    });

  getViesco = async (force = false) =>
    this.getAbsenceFiles(force).then(this.viescoTransform);

  /**
   * @param {import('scolengo-api/types/models/SchoolLife').AbsenceFile[]} absences
   */
  // eslint-disable-next-line class-methods-use-this
  viescoTransform = (absences) => ({
    absences: absences
      .filter(
        (e) =>
          e.currentState.absenceType === 'ABSENCE' ||
          e.currentState.absenceType === 'EXEMPTION'
      )
      .map((absence) => ({
        hours: Math.round(
          (new Date(absence.currentState.absenceEndDateTime).getTime() -
            new Date(absence.currentState.absenceStartDateTime).getTime()) /
            (1000 * 60 * 60)
        ),
        from: absence.currentState.absenceStartDateTime,
        reasons: [
          absence.currentState?.comment?.trim().length > 0
            ? absence.currentState.comment
            : absence.currentState.absenceReason?.longLabel,
        ],
        justified: absence.currentState.absenceFileStatus === 'LOCKED',
      })),
    delays: absences
      .filter(
        (e) =>
          e.currentState.absenceType !== 'ABSENCE' &&
          e.currentState.absenceType !== 'EXEMPTION'
      )
      .map((delay) => ({
        justified: delay.currentState.absenceFileStatus === 'LOCKED',
        reasons: [
          delay.currentState?.comment?.trim().length > 0
            ? delay.currentState.comment
            : delay.currentState.absenceReason?.longLabel,
        ],
        date: delay.currentState.absenceStartDateTime,
        duration: Math.round(
          (new Date(delay.currentState.absenceEndDateTime).getTime() -
            new Date(delay.currentState.absenceStartDateTime).getTime()) /
            (1000 * 60)
        ),
      })),
  });

  /**
   * @returns {Promise<import('scolengo-api/types/models/School').SchoolInfo[]>}
   */
  getSchoolInfos = async (force = false) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.schoolInfos
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const datas = await this.request('get', '/schools-info', {
      include:
        'illustration,school,author,author.person,author.technicalUser,attachments',
    });
    SkolengoCache.setItem(
      SkolengoCache.cacheKeys.schoolInfos,
      datas,
      SkolengoCache.HOUR * 4
    );
    return datas;
  };

  /**
   * @returns {Promise<import('scolengo-api/types/models/School').SchoolInfo>}
   */
  getSchoolInfo = async (schoolInfoId, force = false) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getCollectionItem(
        SkolengoCache.cacheKeys.schoolInfoCollection,
        schoolInfoId,
        {}
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const datas = await this.request('get', `/schools-info/${schoolInfoId}`, {
      include:
        'illustration,school,author,author.person,author.technicalUser,attachments',
    });
    SkolengoCache.setCollectionItem(
      SkolengoCache.cacheKeys.schoolInfoCollection,
      schoolInfoId,
      datas,
      SkolengoCache.HOUR * 4
    );
    return datas;
  };

  getNews = async (force = false) =>
    this.getSchoolInfos(force).then((infos) => infos.map(this.newsTransform));

  getUniqueNews = async (id, force = false) =>
    this.getSchoolInfo(id, force).then(this.newsTransform);

  /**
   * @param {import('scolengo-api/types/models/School').SchoolInfo} info
   */
  // eslint-disable-next-line class-methods-use-this
  newsTransform = (info) => ({
    id: info.id,
    title: ucFirst(info.title),
    content: info.shortContent,
    date: info.publicationDateTime,
    author: info?.school?.name,
    html_content: [{ texte: { V: info.content } }],
    attachments: info.attachments.map((attach) => ({
      url: attach.url,
      name: attach.name,
    })),
  });

  /**
   * @param {string} startDate (format : 2000-12-01)
   * @param {string} endDate (format : 2000-12-31)
   * @param {number} [limit=50]
   * @param {number} [offset=0]
   * @memberof SkolengoDatas
   * @returns {Promise<import('scolengo-api/types/models/Calendar').Agenda[]>}
   */
  getAgendas = (
    startDate,
    endDate,
    limit = 50,
    offset = 0,
    include = 'lessons,lessons.subject,lessons.teachers,homeworkAssignments,homeworkAssignments.subject'
  ) =>
    SkolengoBase.dateVerifier(startDate, endDate || startDate)
      ? this.request('get', '/agendas', {
          include,
          filter: {
            'student.id': this.currentUser.sub,
            date: {
              GE: SkolengoBase.dateParser(startDate),
              LE: SkolengoBase.dateParser(endDate || startDate),
            },
          },
          page: {
            limit,
            offset,
          },
        }).then(async (e) =>
          e.length < limit
            ? e
            : this.getAgendas(startDate, endDate, limit, offset + limit).then(
                (f) => e.concat(f)
              )
        )
      : Promise.resolve([
          {
            id: 'none',
            date: SkolengoBase.dateParser(Date.now()),
            lessons: [],
            homeworkAssignments: [],
          },
        ]);

  /**
   * @returns {Promise<import('scolengo-api/types/models/Results').EvaluationSettings[]>}
   */
  getEvaluationSettings = async (force = false, limit = 20, offset = 0) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.evalSettings
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const settings = await this.request('get', '/evaluations-settings', {
      filter: {
        'student.id': this.currentUser.sub,
      },
      page: {
        limit,
        offset,
      },
      include: 'periods,skillsSetting,skillsSetting.skillAcquisitionColors',
    });
    SkolengoCache.setItem(
      SkolengoCache.cacheKeys.evalSettings,
      settings,
      SkolengoCache.DAY * 3
    );
    return settings;
  };

  /**
   * @returns {Promise<import('scolengo-api/types/models/Results').EvaluationDetail>}
   */
  getEvaluation = async (evaluationId, force = false) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getCollectionItem(
        SkolengoCache.cacheKeys.evalDatas,
        evaluationId,
        {}
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const datas = await this.request('get', `/evaluations/${evaluationId}`, {
      include:
        'evaluationService,evaluationService.subject,evaluationService.teachers,subSubject,subSkills,evaluationResult,evaluationResult.subSkillsEvaluationResults,evaluationResult.subSkillsEvaluationResults.subSkill',
      filter: {
        'student.id': this.currentUser.sub,
      },
      fields: {
        evaluationService: 'subject,teachers',
        subject: 'label,color',
        subSubject: 'label',
        evaluation: 'title,topic,dateTime,coefficient,min,max,average,scale',
        evaluationResult:
          'subSkillsEvaluationResults,nonEvaluationReason,mark,comment',
        subSkill: 'shortLabel',
        subSkillEvaluationResult: 'level,subSkill',
        teacher: 'firstName,lastName,title',
      },
    });
    /* SkolengoCache.getItem('evals', {})
      .then((actualCache) => ({
        ...actualCache.data,
        [evaluationId]: datas,
      }))
      .then((newSavedCache) =>
        SkolengoCache.setItem('evals', newSavedCache, SkolengoCache.HOUR * 4)
      ); */
    SkolengoCache.setCollectionItem(
      SkolengoCache.cacheKeys.evalDatas,
      evaluationId,
      datas,
      SkolengoCache.HOUR * 4
    );
    return datas;
  };

  /**
   * @returns {Promise<import('./SkolengoCustomTypes').Period[]>}
   */
  getPeriods = async (force = false) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.periods
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const datas = await this.getEvaluationSettings(force).then((e) =>
      e.at(0)?.periods?.map((period) => this.periodTransform(period))
    );
    if (datas !== undefined)
      SkolengoCache.setItem(
        SkolengoCache.cacheKeys.periods,
        datas,
        SkolengoCache.DAY * 14
      );
    return datas;
  };

  /**
   *
   * @param {number|string} periodId
   * @param {boolean} [force=false]
   * @param {number} [limit=100]
   * @param {number} [offset=0]
   * @returns {Promise<import('./SkolengoCustomTypes').Grades>}
   */
  getGrades = async (periodId, force = false, limit = 100, offset = 0) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.grades
      );
      if (
        !cachedRecap.expired &&
        Array.isArray(cachedRecap.data?.grades) &&
        Number(cachedRecap.data?.periodId) === Number(periodId)
      )
        return cachedRecap.data;
    }
    if (!periodId)
      periodId = this.getPeriods(false).then(
        (periods) => periods.find((period) => period.actual)?.id
      );
    if (typeof periodId !== 'string' && typeof periodId !== 'number')
      return this.gradesTransform([]);

    const datas = await this.getNotes(periodId, limit, offset)
      .then((evals) => this.noteFullFill(evals, force))
      .then(this.gradesTransform);
    SkolengoCache.setItem(
      SkolengoCache.cacheKeys.grades,
      { ...datas, periodId },
      SkolengoCache.HOUR * 4
    );
    return datas;
  };

  /**
   * @param {import('scolengo-api/types/models/Results').Evaluation[]} evals
   */
  noteFullFill = async (evals, force = false) =>
    Promise.all(
      evals.map(async (evalSubj) => ({
        ...evalSubj,
        evaluations: await Promise.all(
          evalSubj.evaluations.map((evalData) =>
            this.getEvaluation(evalData.id, force)
          )
        ),
      }))
    );

  /**
   * @returns {Promise<import('scolengo-api/types/models/Results').Evaluation[]>}
   */
  getNotes = async (periodId, limit = 100, offset = 0) =>
    this.request('get', '/evaluation-services', {
      filter: {
        'student.id': this.currentUser.sub,
        'period.id': periodId,
      },
      page: {
        limit,
        offset,
      },
      include:
        'subject,evaluations,evaluations.evaluationResult,evaluations.evaluationResult.subSkillsEvaluationResults,evaluations.evaluationResult.subSkillsEvaluationResults.subSkill,evaluations.subSkills,teachers',
      fields: {
        evaluationService: 'coefficient,average,studentAverage,scale',
        subject: 'label,color',
        evaluation:
          'dateTime,coefficient,average,scale,evaluationResult,subSkills',
        evaluationResult: 'mark,nonEvaluationReason,subSkillsEvaluationResults',
        subSkillEvaluationResult: 'level,subSkill',
        teacher: 'firstName,lastName,title',
        subSkill: 'shortLabel',
      },
    })
      .then(async (e) =>
        e.length < limit
          ? e
          : this.getNotes(periodId, limit, offset + limit).then((f) => [
              ...e,
              ...f,
            ])
      )
      .catch((e) => {
        console.log('perioderr', periodId, e);
      });

  /**
   * @returns {Promise<import('scolengo-api/types/models/Calendar').HomeworkAssignment[]>}
   */
  getHomeworkAssignments = async (
    startDate,
    endDate,
    limit = 20,
    offset = 0
  ) =>
    SkolengoBase.dateVerifier(startDate, endDate)
      ? this.request('get', '/homework-assignments', {
          include: 'subject,teacher,teacher.person',
          filter: {
            'student.id': this.currentUser.sub,
            dueDate: {
              GE: SkolengoBase.dateParser(startDate),
              LE: SkolengoBase.dateParser(endDate),
            },
          },
          page: {
            limit,
            offset,
          },
        }).then(async (e) =>
          e.length < limit
            ? e
            : this.getHomeworkAssignments(
                startDate,
                endDate,
                limit,
                offset + limit
              ).then((f) => e.concat(f))
        )
      : [];

  /**
   * @returns {Promise<import('scolengo-api/types/models/Calendar').HomeworkAssignment>}
   */
  // route non utilisé actuellement
  getHomeworkAssignment = async (homeworkId /* , force = false */) =>
    this.request('get', `/homework-assignments/${homeworkId}`, {
      include:
        'subject,teacher,teacher.person,pedagogicContent,individualCorrectedWork,individualCorrectedWork.attachments,individualCorrectedWork.audio,commonCorrectedWork,commonCorrectedWork.attachments,commonCorrectedWork.audio,commonCorrectedWork.pedagogicContent,attachments,audio',
      filter: {
        'student.id': this.currentUser.sub,
      },
    });

  getHomeworks = async (day, force, day2) => {
    const canBeCached =
      day2 && SkolengoBase.dateParser(day) !== SkolengoBase.dateParser(day2);
    const dayFormatted = SkolengoBase.dateParser(day);
    const day2Formatted = SkolengoBase.dateParser(day2 || day);
    if (!force && canBeCached) {
      const cachedRecap = await SkolengoCache.getCollectionItem(
        SkolengoCache.cacheKeys.homeworkList,
        dayFormatted,
        {}
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    console.log('fetch hw', dayFormatted);
    const datas = await this.getAgendas(
      dayFormatted,
      day2Formatted,
      50,
      0,
      'homeworkAssignments,homeworkAssignments.subject'
    )
      .then(
        (e) =>
          e?.map((f) =>
            f.homeworkAssignments.map((g) => this.homeworkTransform(g))
          ) || []
      )
      .then((e) => (canBeCached ? e.flat() : e));
    if (canBeCached)
      SkolengoCache.setCollectionItem(
        SkolengoCache.cacheKeys.homeworkList,
        dayFormatted,
        datas,
        SkolengoCache.HOUR * 4
      );
    return datas;
  };

  getLongHomeworks = async (day, day2) => {
    if (!day2) day2 = day;
    return this.getAgendas(
      SkolengoBase.dateParser(day),
      SkolengoBase.dateParser(day2),
      50,
      0,
      'homeworkAssignments,homeworkAssignments.subject'
    ).then((e) =>
      e?.map((f) => ({
        date: f.date,
        homeworks: f.homeworkAssignments.map((g) => this.homeworkTransform(g)),
      }))
    );
  };

  /**
   * @returns {Promise<import('scolengo-api/types/models/Calendar').HomeworkAssignment>}
   */
  patchHomeworkAssignment = async (homeworkId, done) => {
    const homework = await this.request(
      'patch',
      `/homework-assignments/${homeworkId}`,
      {
        include: 'subject,teacher,teacher.person',
        filter: {
          'student.id': this.currentUser.sub,
        },
      },
      {
        data: {
          type: 'homework',
          id: homeworkId,
          attributes: {
            done,
          },
        },
      }
    );
    const date = new Date(homework.dueDateTime || homework.dueDate);
    const validDate = Number.isNaN(date.getTime()) ? null : date.toISOString();
    if (validDate) this.getHomeworks(date, true);
    return homework;
  };

  /**
   * @returns {Promise<import('scolengo-api/types/models/Calendar').Lesson>}
   */
  getLesson = async (lessonId) =>
    this.request('get', `/lessons/${lessonId}`, {
      include:
        'teachers,contents,contents.attachments,subject,toDoForTheLesson,toDoForTheLesson.subject,toDoAfterTheLesson,toDoAfterTheLesson.subject',
      filter: {
        'student.id': this.currentUser.sub,
      },
    });

  getTimetable = async (day, force = false) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.timetable
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    const agendas = await this.getAgendas(
      SkolengoBase.dateParser(day),
      SkolengoBase.dateParser(day)
    );
    const datas = this.timetableTransform(agendas[0]);
    SkolengoCache.setItem(
      SkolengoCache.cacheKeys.timetable,
      datas,
      SkolengoCache.MINUTE * 30
    );
    return datas;
  };

  static gradesDefault = {
    grades: [],
    averages: [],
    overall_average: 0,
    class_overall_average: 0,
  };

  getRecap = async (startDate, force) => {
    if (!force) {
      const cachedRecap = await SkolengoCache.getItem(
        SkolengoCache.cacheKeys.recap
      );
      if (!cachedRecap.expired) return cachedRecap.data;
    }
    try {
      const [timetable, homeworkAgendas, notes] = await Promise.all([
        this.getTimetable(SkolengoBase.dateParser(startDate), force),
        this.getAgendas(
          SkolengoBase.dateParser(startDate),
          SkolengoBase.dateParser(
            new Date(startDate).getTime() + 15 * 24 * 60 * 60 * 1000
          ),
          50,
          0,
          'homeworkAssignments,homeworkAssignments.subject'
        ),
        this.getEvaluationSettings(force).then((periods) =>
          this.getGrades(periods[0].periods[0].id, force)
        ),
      ]);
      const hws = homeworkAgendas
        .filter((e) => e.homeworkAssignments.length > 0)
        .map((homeworkAgenda) => ({
          date: new Date(homeworkAgenda.date),
          hws: homeworkAgenda.homeworkAssignments.map((homework) =>
            this.homeworkTransform(homework)
          ),
        }));
      const res = [
        timetable,
        hws.at(0) || {
          date: new Date(startDate),
          hws: [],
        },
        notes,
        hws.at(1) || {
          date: new Date(startDate),
          hws: [],
        },
        hws.at(2) || {
          date: new Date(startDate),
          hws: [],
        },
        hws,
      ];
      SkolengoCache.setItem(
        SkolengoCache.cacheKeys.recap,
        res,
        SkolengoCache.msToTomorrow()
      );
      return res;
    } catch (e) {
      console.log('recap err', e);
      return [[], [], SkolengoDatas.gradesDefault];
    }
  };

  /**
   * @param {import("scolengo-api/types/models/Common/User").User} user
   */
  usrTransform = (user) => ({
    id: user.id,
    name: `${user.lastName.toUpperCase()} ${user.firstName}`,
    class: null,
    establishment:
      user.school && user.school.id === this.school.id ? this.school.name : '',
    phone: user.mobilePhone,
    email: user.importedMail || user.internalMail || user.externalMail,
    address:
      user.school && user.school.id === this.school.id
        ? [
            this.school.addressLine1,
            this.school.addressLine2,
            this.school.addressLine3,
            this.school.zipCode,
            this.school.city,
            this.school.country,
          ].filter((e) => e)
        : [],
    ine: null,
    profile_picture: null,
    delegue: [],
    periods: [],
  });

  /**
   * @param {import('scolengo-api/types/models/Calendar').Agenda[]} agendas
   */
  // eslint-disable-next-line class-methods-use-this
  timetableTransform = (
    agenda = {
      id: 'none',
      date: SkolengoBase.dateParser(Date.now()),
      lessons: [],
    }
  ) =>
    agenda?.lessons?.map((lesson) => ({
      id: lesson.id,
      num: lesson.id,
      subject: {
        id: lesson.subject.id,
        name: lesson.subject.label,
        groups: false,
      },
      teachers: lesson?.teachers?.map(
        (e) => `${e.lastName} ${e.firstName.slice(0, 1)}.`
      ),
      rooms: [lesson.location].filter((e) => e),
      group_names: [],
      memo: null,
      virtual: [],
      start: lesson.startDateTime,
      end: lesson.endDateTime,
      background_color: lesson.subject.color,
      status: null,
      is_cancelled: lesson.canceled,
      is_outing: false,
      is_detention: false,
      is_exempted: false,
      is_test: false,
    }));

  /**
   * @param {import('scolengo-api/types/models/Results').Evaluation[]} evals
   */
  // eslint-disable-next-line class-methods-use-this
  gradesTransform = (evals = []) => ({
    grades: evals
      .map((evalSubj) =>
        evalSubj.evaluations.map((evalData) => ({
          id: evalData.id,
          subject: {
            id: evalSubj.subject.id,
            name: evalSubj.subject.label,
            groups: false,
          },
          date: evalData.dateTime,
          description: ucFirst(
            evalData.topic?.trim() || evalData.title?.trim() || ''
          ),
          is_bonus: false,
          is_optional: false,
          is_out_of_20: evalData.scale === 20,
          grade: {
            value: evalData.evaluationResult.mark,
            out_of: evalData.scale,
            coefficient: evalData.coefficient,
            average: evalData.average,
            max: evalData.max,
            min: evalData.min,
            significant:
              evalData.evaluationResult.nonEvaluationReason ||
              typeof evalData.evaluationResult.mark !== 'number'
                ? 3
                : 0,
          },
        }))
      )
      .flat(),
    averages:
      evals
        ?.filter((e) => e.evaluations?.length > 0)
        .map((evalSubj) => ({
          subject: {
            id: evalSubj.subject.id,
            name: evalSubj.subject.label,
            groups: false,
          },
          average: evalSubj.studentAverage,
          class_average: evalSubj.average,
          max: evalSubj.evaluations.reduce(
            (acc, e) => (acc > e.max ? acc : e.max),
            0
          ),
          min: evalSubj.evaluations.reduce(
            (acc, e) => (acc < e.min ? acc : e.min),
            20
          ),
          out_of: 20,
          significant: 0,
          color: evalSubj.subject.color,
        })) || [],
    overall_average: 10,
    class_overall_average: 10,
  });

  /**
   * @param {import('scolengo-api/types/models/Calendar').HomeworkAssignment} homework
   */
  // eslint-disable-next-line class-methods-use-this
  homeworkTransform = (homework) => {
    const dat = new Date(homework.dueDateTime || homework.dueDate);
    if (Number.isNaN(dat.getTime()))
      console.log({
        homework,
      });
    return {
      id: homework.id,
      done: homework.done,
      date: Number.isNaN(dat.getTime()) ? null : dat.toISOString(),
      background_color: homework.subject.color,
      subject: {
        id: homework.subject.id,
        name: homework.subject.label,
      },
      description: homework.html
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((e) => e.trim())
        .filter((e) => e.length > 0)
        .join('\n'),
      files: (homework.attachments || []).map((attach) => ({
        id: attach.id,
        url: attach.url,
        type: 0,
        name: attach.name,
      })),
    };
  };

  /**
   * @param {import('scolengo-api/types/models/Results/EvaluationSettings').Period} period
   */
  // eslint-disable-next-line class-methods-use-this
  periodTransform = (period) => ({
    id: period.id,
    name: period.label,
    actual:
      new Date() > new Date(period.startDate) &&
      new Date() < new Date(period.endDate),
  });

  skolengoDisconnect = async () => {
    const discovery = await AsyncStorage.getItem(SkolengoDatas.DISCOVERY_PATH);
    return Promise.all([
      revokeAsync(this.rtInstance, discovery),
      AsyncStorage.removeItem(SkolengoDatas.TOKEN_PATH),
      AsyncStorage.removeItem(SkolengoDatas.SCHOOL_PATH),
      AsyncStorage.removeItem(SkolengoDatas.CURRENT_USER_PATH),
      AsyncStorage.removeItem(SkolengoDatas.DISCOVERY_PATH),
      SkolengoCache.clearItems(),
    ]);
  };
}

export const ucFirst = (str) =>
  (str?.charAt(0)?.toUpperCase() ?? '') + (str?.slice(1) ?? '');

const errHandler = (err) => {
  if (err instanceof Error) console.error(err);
  Alert.alert(
    'Erreur',
    'Une erreur est survenue lors de la connexion à Skolengo. Veuillez réessayer.'
  );
};

/**
 * @param {typeof import("../../../utils/AppContext").DefaultValuesAppContext} appctx
 * @param {any} navigation
 * @param {import("scolengo-api/types/models/School").School} school
 * @param {SkolengoDatas} [skolengoInstance=undefined]
 */
export const loginSkolengoWorkflow = async (
  appctx,
  navigation,
  school,
  skolengoInstance = undefined
) => {
  const disco = await Promise.all([
    fetch(school.emsOIDCWellKnownUrl)
      .then((res) => res.json())
      .then((res) => res.issuer),
    warmUpAsync(),
  ])
    .then(([issuer]) => resolveDiscoveryAsync(issuer))
    .catch(errHandler);
  const authRes = new AuthRequest({
    clientId: SkolengoStatic.OID_CLIENT_ID,
    clientSecret: SkolengoStatic.OID_CLIENT_SECRET,
    redirectUri: 'skoapp-prod://sign-in-callback',
    extraParams: {
      scope: 'openid',
      response_type: 'code',
    },
    usePKCE: false,
  });
  const res = await authRes.promptAsync(disco).catch(errHandler);
  coolDownAsync();
  if (res?.type === 'dismiss') return;
  if (!res.params?.code) {
    return errHandler(res.error);
  }
  const token = await exchangeCodeAsync(
    {
      clientId: SkolengoStatic.OID_CLIENT_ID,
      clientSecret: SkolengoStatic.OID_CLIENT_SECRET,
      code: res.params.code,
      redirectUri: 'skoapp-prod://sign-in-callback',
    },
    disco
  ).catch(errHandler);
  if (!token) return errHandler();
  await Promise.all([
    AsyncStorage.setItem('service', 'Skolengo'),
    AsyncStorage.setItem('token', 'skolengo'),
  ]);
  showMessage({
    message: 'Connecté avec succès',
    type: 'success',
    icon: 'auto',
    floating: true,
  });
  if (appctx) {
    const a = new SkolengoDatas(token, school);
    await a.saveToken(disco);
    appctx.dataprovider.init('Skolengo').then(() => {
      appctx.setLoggedIn(true);
      navigation.popToTop();
    });
    return true;
  }
  skolengoInstance.school = school;
  skolengoInstance.rtInstance = token;
  return skolengoInstance;
};
