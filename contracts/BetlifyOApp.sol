// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { BetlifyMsgCodec } from "./libs/BetlifyMsgCodec.sol";

contract BetlifyEvmAdapter is Ownable, OApp, OAppOptionsType3 {
    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    // Send a Betlify Action to Solana OApp
    function sendBetlifyAction(
        uint32 dstEid,
        bytes calldata message,
        bytes calldata optionsData
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory lzOptions = combineOptions(dstEid, 1, optionsData);
        receipt = _lzSend(dstEid, message, lzOptions, MessagingFee(msg.value, 0), payable(msg.sender));
    }

    // Handle incoming messages from Solana (stub)
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata /*payload*/,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // TODO: handle Solana -> EVM messages (e.g., payout confirmations)
    }
} 