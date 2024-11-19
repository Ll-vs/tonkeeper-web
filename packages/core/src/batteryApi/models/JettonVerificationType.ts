/* tslint:disable */
/* eslint-disable */
/**
 * Custodial-Battery REST API.
 * REST API for Custodial Battery which provides gas to different networks to help execute transactions.
 *
 * The version of the OpenAPI document: 0.0.1
 * Contact: support@tonkeeper.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * 
 * @export
 */
export const JettonVerificationType = {
    Whitelist: 'whitelist',
    Blacklist: 'blacklist',
    None: 'none'
} as const;
export type JettonVerificationType = typeof JettonVerificationType[keyof typeof JettonVerificationType];


export function instanceOfJettonVerificationType(value: any): boolean {
    for (const key in JettonVerificationType) {
        if (Object.prototype.hasOwnProperty.call(JettonVerificationType, key)) {
            if (JettonVerificationType[key as keyof typeof JettonVerificationType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function JettonVerificationTypeFromJSON(json: any): JettonVerificationType {
    return JettonVerificationTypeFromJSONTyped(json, false);
}

export function JettonVerificationTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): JettonVerificationType {
    return json as JettonVerificationType;
}

export function JettonVerificationTypeToJSON(value?: JettonVerificationType | null): any {
    return value as any;
}

export function JettonVerificationTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): JettonVerificationType {
    return value as JettonVerificationType;
}
