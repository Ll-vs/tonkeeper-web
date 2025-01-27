import { APIConfig } from '../../../entries/apis';
import { walletContractFromState } from '../../wallet/contractService';
import { externalMessage, getServerTime, getTTL, getWalletSeqNo } from '../utils';
import { CellSigner } from '../../../entries/signer';
import { WalletOutgoingMessage } from '../encoder/types';
import { BlockchainApi, EmulationApi } from '../../../tonApiV2';
import { TonWalletStandard } from '../../../entries/wallet';
import { WalletContractV5R1 } from '@ton/ton';
import { ISender } from './ISender';
import { AssetAmount } from '../../../entries/crypto/asset/asset-amount';
import { TON_ASSET } from '../../../entries/crypto/asset/constants';

export class WalletMessageSender implements ISender {
    constructor(
        private readonly api: APIConfig,
        private readonly wallet: TonWalletStandard,
        private readonly signer: CellSigner
    ) {}

    public get excessAddress() {
        return this.wallet.rawAddress;
    }

    public async send(outgoing: WalletOutgoingMessage) {
        const external = await this.toExternal(outgoing);

        await new BlockchainApi(this.api.tonApiV2).sendBlockchainMessage({
            sendBlockchainMessageRequest: { boc: external.toBoc().toString('base64') }
        });

        return external;
    }

    public async estimate(outgoing: WalletOutgoingMessage) {
        const external = await this.toExternal(outgoing);

        const result = await new EmulationApi(this.api.tonApiV2).emulateMessageToWallet({
            emulateMessageToWalletRequest: { boc: external.toBoc().toString('base64') }
        });

        return {
            extra: new AssetAmount({ asset: TON_ASSET, weiAmount: result.event.extra * -1 }),
            event: result.event
        };
    }

    private async toExternal({ messages, sendMode }: WalletOutgoingMessage) {
        const timestamp = await getServerTime(this.api);
        const seqno = await getWalletSeqNo(this.api, this.wallet.rawAddress);

        const contract = walletContractFromState(this.wallet) as WalletContractV5R1;
        const transfer = await contract.createTransfer({
            seqno,
            signer: this.signer,
            timeout: getTTL(timestamp),
            sendMode,
            messages
        });
        return externalMessage(contract, seqno, transfer);
    }
}
