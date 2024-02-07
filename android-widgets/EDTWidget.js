import React from 'react';
import { FlexWidget, TextWidget, OverlapWidget } from 'react-native-android-widget';
import getClosestGradeEmoji from '../utils/EmojiCoursName';

export function EDTWidget({ edt, noaccount, error }) {
  if(typeof edt !== 'undefined') return EDTWidgetRender(edt)
  if(noaccount) return Loading(false)
  if(error) return Loading(null, true)
  else {
    require("./getEDT")(EDTWidget, "EDT")
    return Loading()
  }
}

export function Loading(account = true, error = false) {
  return (
    <FlexWidget style={{height: 'match_parent',
    width: 'match_parent',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000055',
    borderRadius: 16}}>
      {error ? <TextWidget
        text="Une erreur est survenue"
        style={{fontSize: 20, color:"#fff"}}
      /> : account ? <TextWidget
      text="Chargement des données..."
      style={{fontSize: 20, color:"#fff"}}
      /> :
      <TextWidget
      text="Aucun compte connecté, veuillez ouvrir l'application Papillon et vous connecter."
      style={{fontSize: 20, color:"#fff"}}
      />
      }
    </FlexWidget>
  )
}

export function EDTWidgetRender(edt) {
  if(edt === null)
    return (
      <FlexWidget style={{height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000055',
        borderRadius: 16}}>
          <TextWidget
            text="Aucun cours restant aujourd'hui."
            style={{fontSize: 20, color:"#fff"}}
          />
      </FlexWidget>
    )
  else {
    return (
      <OverlapWidget style={{ width: "match_parent", height: "match_parent" }}>
        <OverlapWidget style={{ backgroundColor: "#32ab8e", height: 21, width: "match_parent" }}>
          <FlexWidget style={{ justifyContent: "center", height: "match_parent" }}>
            <TextWidget 
              text="Papillon EDT"
              style={styles.Header}
            />
          </FlexWidget>
        </OverlapWidget>
        <OverlapWidget style={{ marginTop: 21, backgroundColor: edt.next.background_color, height: 80.3, width: "match_parent" }}>
          <FlexWidget style={{ justifyContent: 'center', height: "match_parent", marginLeft: 15 }}>
            <TextWidget
              text={getClosestGradeEmoji(edt.next.subject.name)}
              style={{ fontSize: 30 }}
            />
          </FlexWidget>
          <FlexWidget style={{ justifyContent: 'center', height: "match_parent", marginLeft: 65, width: 200, borderRightColor: "#ffffff30", borderRightWidth: 2 }}>
            <TextWidget
              text={edt.next.subject.name}
              style={styles.TitleCours}
            />
            <TextWidget
              text={"Salle " + edt.next.rooms[0]}
              style={styles.DescriptionCours}
            />
            <TextWidget
              text={"Avec " + edt.next.teachers[0]}
              style={styles.DescriptionCours}
            />
            {
              edt.next.status ? (
                <TextWidget
                  text={edt.next.status}
                  style={edt.next.is_cancelled ? styles.DescriptionCoursAnnule : styles.DescriptionCoursAnnote}
                />
              ) : (
                null
              )
            }
          </FlexWidget>
          <FlexWidget style={{ justifyContent: 'center', marginLeft: 265, width: 109, height: 80.3, backgroundColor: "#ffffff50", paddingRight: 10 }}>
            <TextWidget
              text="à 10:20"
              style={styles.HeureCours}
            />
            <TextWidget
              text="Dans 30 min."
              style={styles.TimestampCours}
            />
          </FlexWidget>
        </OverlapWidget>
        {edt.nextClasses[0].background_color ? (
        <OverlapWidget style={{ marginTop: 101.3, backgroundColor: "#00000055", height: 80.3, width: "match_parent", borderColor: "#00000077", borderTopWidth: 2 }}>
          <FlexWidget style={{ justifyContent: 'center', height: "match_parent", marginLeft: 15 }}>
            <TextWidget
              text={getClosestGradeEmoji(edt.nextClasses[0].subject.name)}
              style={{ fontSize: 30 }}
            />
          </FlexWidget>
          <FlexWidget style={{ justifyContent: 'center', height: "match_parent", marginLeft: 65, width: 200, borderRightColor: "#ffffff30", borderRightWidth: 2 }}>
            <TextWidget
              text={edt.nextClasses[0].subject.name}
              style={{...styles.TitleCours, color: edt.nextClasses[0].background_color, }}
            />
            <TextWidget
              text={"Salle " + edt.nextClasses[0].rooms[0]}
              style={styles.DescriptionCours}
            />
            <TextWidget
              text={"Avec " + edt.nextClasses[0].teachers[0]}
              style={styles.DescriptionCours}
            />
            {
              edt.nextClasses[0].status ? (
                <TextWidget
                  text={edt.nextClasses[0].status}
                  style={edt.nextClasses[0].is_cancelled ? styles.DescriptionCoursAnnule : styles.DescriptionCoursAnnote}
                />
              ) : (
                null
              )
            }
          </FlexWidget>
          <FlexWidget style={{ justifyContent: 'center', marginLeft: 265, width: 109, height: 80.3, backgroundColor: "#ffffff25", paddingRight: 10 }}>
            <TextWidget
              text="à 11:20"
              style={styles.HeureCours}
            />
            <TextWidget
              text="Dans 1h 30 min."
              style={styles.TimestampCours}
            />
            <TextWidget
              text="Remplacement"
              style={styles.DescriptionCoursAnnote}
            />
          </FlexWidget>
        </OverlapWidget>
        ) : (
          <OverlapWidget style={{ marginTop: 101.3, backgroundColor: "#00000055", height: 80.3, width: "match_parent", borderColor: "#00000077", borderTopWidth: 2 }}>

          </OverlapWidget>
        )}
        <OverlapWidget style={{ marginTop: 181.6, backgroundColor: "#00000055", height: 80.3, width: "match_parent", borderColor: "#00000077", borderTopWidth: 2 }}>
          <FlexWidget style={{ justifyContent: 'center', height: "match_parent", marginLeft: 15 }}>
            <TextWidget
              text="📚"
              style={{ fontSize: 30 }}
            />
          </FlexWidget>
          <FlexWidget style={{ justifyContent: 'center', height: "match_parent", marginLeft: 65, width: 200, borderRightColor: "#ffffff30", borderRightWidth: 2 }}>
            <TextWidget
              text="FRANCAIS"
              style={{...styles.TitleCours, color: "#ffff00", }}
            />
            <TextWidget
              text="Salle B204"
              style={styles.DescriptionCours}
            />
            <TextWidget
              text="Avec M. QUELQUECHOSE"
              style={styles.DescriptionCours}
            />
            <TextWidget
              text="Remplacement"
              style={styles.DescriptionCoursAnnote}
            />
          </FlexWidget>
          <FlexWidget style={{ justifyContent: 'center', marginLeft: 265, width: 109, height: 80.3, backgroundColor: "#ffffff25", paddingRight: 10 }}>
            <TextWidget
              text="à 11:20"
              style={styles.HeureCours}
            />
            <TextWidget
              text="Dans 1h 30 min."
              style={styles.TimestampCours}
            />
          </FlexWidget>
        </OverlapWidget>
      </OverlapWidget>
    );
  }
}

let styles = {
  Header: {
    fontSize: 10
  },
  TitleCours: {
    fontSize: 18,
    fontFamily: 'FixelText-SemiBold',
    color: '#ffffff',
    marginTop: 2,
  },
  HeureCours: {
    fontSize: 18,
    fontFamily: 'FixelText-SemiBold',
    color: '#ffffff',
    marginTop: 2,
    textAlign: "right",
    width: "match_parent"
  },
  DescriptionCours: {
    fontFamily: 'FixelText-Regular',
    fontSize: 15,
    color: '#ffffff99',
  },
  TimestampCours: {
    fontFamily: 'FixelText-Regular',
    fontSize: 15,
    color: '#ffffff99',
    textAlign: "right",
    width: "match_parent"
  },
  DescriptionCoursAnnule: {
    fontFamily: 'FixelText-Regular',
    fontSize: 15,
    color: '#ffffff',
    borderRadius: 7,
    backgroundColor: "#ED4245",
    paddingTop: 2,
    paddingBottom: 2,
    maxWidth: "match_parent",
    paddingLeft: 3
  },
  DescriptionCoursAnnote: {
    fontFamily: 'FixelText-Regular',
    fontSize: 15,
    color: '#ffffff',
    borderRadius: 7,
    backgroundColor: "#00000055",
    paddingTop: 2,
    paddingBottom: 2,
    maxWidth: "match_parent",
    paddingLeft: 4,
    paddingRight: 4
  }
}