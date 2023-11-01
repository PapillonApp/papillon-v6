import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { EDTWidget } from './EDTWidget';
import { ClickDemoWidget } from './ClickWidget';

const nameToWidget = {
  // Hello will be the **name** with which we will reference our widget.
  EDT: EDTWidget,
  ClickDemo: ClickDemoWidget
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_UPDATE':
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_DELETED':
      // Not needed for now
      break;

    case 'WIDGET_CLICK':
      // Not needed for now
      break;

    default:
      break;
  }
}