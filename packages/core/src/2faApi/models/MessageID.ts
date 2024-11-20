/* tslint:disable */
/* eslint-disable */
/**
 * REST API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.1
 * Contact: contact@tonaps.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface MessageID
 */
export interface MessageID {
    /**
     * 
     * @type {string}
     * @memberof MessageID
     */
    messageId: string;
}

/**
 * Check if a given object implements the MessageID interface.
 */
export function instanceOfMessageID(value: object): value is MessageID {
    if (!('messageId' in value) || value['messageId'] === undefined) return false;
    return true;
}

export function MessageIDFromJSON(json: any): MessageID {
    return MessageIDFromJSONTyped(json, false);
}

export function MessageIDFromJSONTyped(json: any, ignoreDiscriminator: boolean): MessageID {
    if (json == null) {
        return json;
    }
    return {
        
        'messageId': json['message_id'],
    };
}

  export function MessageIDToJSON(json: any): MessageID {
      return MessageIDToJSONTyped(json, false);
  }

  export function MessageIDToJSONTyped(value?: MessageID | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message_id': value['messageId'],
    };
}

