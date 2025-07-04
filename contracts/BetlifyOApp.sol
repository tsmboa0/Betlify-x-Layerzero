// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { BetlifyMsgCodec } from "./libs/BetlifyMsgCodec.sol";

contract BetlifyEvmAdapter is Ownable, OApp, OAppOptionsType3 {
    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    // Create a new prediction market
    function createPool(
        uint32 dstEid,
        string calldata question,
        string[] calldata options,
        int64 startTime,
        int64 lockTime,
        int64 endTime,
        uint64 poolId,
        bytes calldata optionsData
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory message = BetlifyMsgCodec.encodeCreatePool(question, options, startTime, lockTime, endTime, poolId);
        bytes memory lzOptions = combineOptions(dstEid, 1, optionsData);
        receipt = _lzSend(dstEid, message, lzOptions, MessagingFee(msg.value, 0), payable(msg.sender));
    }

    // Place a bet
    function placeBet(
        uint32 dstEid,
        address authority,
        uint64 poolId,
        uint8 option,
        uint64 amount,
        bytes calldata optionsData
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory message = BetlifyMsgCodec.encodePlaceBet(authority, poolId, option, amount);
        bytes memory lzOptions = combineOptions(dstEid, 1, optionsData);
        receipt = _lzSend(dstEid, message, lzOptions, MessagingFee(msg.value, 0), payable(msg.sender));
    }

    // Resolve a market
    function resolveMarket(
        uint32 dstEid,
        uint64 poolId,
        uint8 winningOption,
        bytes calldata optionsData
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory message = BetlifyMsgCodec.encodeResolveMarket(poolId, winningOption);
        bytes memory lzOptions = combineOptions(dstEid, 1, optionsData);
        receipt = _lzSend(dstEid, message, lzOptions, MessagingFee(msg.value, 0), payable(msg.sender));
    }

    // Claim winnings
    function claimWinnings(
        uint32 dstEid,
        uint64 poolId,
        bytes calldata optionsData
    ) external payable returns (MessagingReceipt memory receipt) {
        bytes memory message = BetlifyMsgCodec.encodeClaimWinnings(poolId);
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