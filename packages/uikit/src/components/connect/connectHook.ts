import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ConnectItemReply,
    DAppManifest,
    TonConnectTransactionPayload
} from '@tonkeeper/core/dist/entries/tonConnect';
import { parseTonTransferWithAddress } from '@tonkeeper/core/dist/service/deeplinkingService';
import {
    connectRejectResponse,
    parseTonConnect,
    saveWalletTonConnect,
    sendTransactionErrorResponse,
    sendTransactionSuccessResponse
} from '@tonkeeper/core/dist/service/tonConnect/connectService';
import {
    AccountConnection,
    TonConnectParams
} from '@tonkeeper/core/dist/service/tonConnect/connectionService';
import { sendEventToBridge } from '@tonkeeper/core/dist/service/tonConnect/httpBridge';
import { useAppSdk } from '../../hooks/appSdk';
import { useTranslation } from '../../hooks/translation';
import { QueryKey } from '../../libs/queryKey';
import { useActiveAccountQuery } from '../../state/wallet';
import { BLOCKCHAIN_NAME } from '@tonkeeper/core/dist/entries/crypto';
import { useToast } from '../../hooks/useNotification';

export const useGetConnectInfo = () => {
    const sdk = useAppSdk();
    const { t } = useTranslation();
    const notifyError = useToast();

    return useMutation<null | TonConnectParams, Error, string>(async url => {
        try {
            const transfer = parseTonTransferWithAddress({ url });

            if (transfer) {
                sdk.uiEvents.emit('copy', {
                    method: 'copy',
                    id: Date.now(),
                    params: t('loading')
                });

                sdk.uiEvents.emit('transfer', {
                    method: 'transfer',
                    id: Date.now(),
                    params: { chain: BLOCKCHAIN_NAME.TON, ...transfer, from: 'qr-code' }
                });
                return null;
            }

            const params = parseTonConnect({ url });

            if (typeof params === 'string') {
                console.error(params);
                throw new Error('Unsupported link');
            }

            // TODO: handle auto connect

            sdk.uiEvents.emit('copy', {
                method: 'copy',
                id: Date.now(),
                params: t('loading')
            });

            return params;
        } catch (e) {
            notifyError(String(e));
            throw e;
        }
    });
};

export interface AppConnectionProps {
    params: TonConnectParams;
    replyItems?: ConnectItemReply[];
    manifest?: DAppManifest;
}

export const useResponseConnectionMutation = () => {
    const sdk = useAppSdk();
    const { data } = useActiveAccountQuery();
    const client = useQueryClient();

    return useMutation<undefined, Error, AppConnectionProps>(
        async ({ params, replyItems, manifest }) => {
            if (replyItems && manifest && data) {
                const response = await saveWalletTonConnect({
                    storage: sdk.storage,
                    account: data,
                    manifest,
                    params,
                    replyItems,
                    appVersion: sdk.version
                });

                await sendEventToBridge({
                    response,
                    sessionKeyPair: params.sessionKeyPair,
                    clientSessionId: params.clientSessionId
                });

                await client.invalidateQueries([QueryKey.tonConnectConnection]);
                await client.invalidateQueries([QueryKey.tonConnectLastEventId]);
            } else {
                await sendEventToBridge({
                    response: connectRejectResponse(),
                    sessionKeyPair: params.sessionKeyPair,
                    clientSessionId: params.clientSessionId
                });
            }

            return undefined;
        }
    );
};

export interface SendTransactionAppRequest {
    id: string;
    connection: AccountConnection;
    payload: TonConnectTransactionPayload;
}

export interface ResponseSendProps {
    request: SendTransactionAppRequest;
    boc?: string;
}

export const useResponseSendMutation = () => {
    return useMutation<undefined, Error, ResponseSendProps>(
        async ({ request: { connection, id }, boc }) => {
            const response = boc
                ? sendTransactionSuccessResponse(id, boc)
                : sendTransactionErrorResponse(id);

            await sendEventToBridge({
                response,
                sessionKeyPair: connection.sessionKeyPair,
                clientSessionId: connection.clientSessionId
            });

            return undefined;
        }
    );
};
