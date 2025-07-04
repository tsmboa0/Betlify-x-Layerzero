// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import { BetlifyMsgCodec } from "../../contracts/libs/BetlifyMsgCodec.sol";

contract BetlifyMsgCodecTest is Test {
    function testEncodeCreatePool() public {
        string memory question = "Who will win?";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        int64 startTime = 1700000000;
        int64 lockTime = 1700003600;
        int64 endTime = 1700007200;
        uint64 poolId = 42;

        bytes memory encoded = BetlifyMsgCodec.encodeCreatePool(
            question, options, startTime, lockTime, endTime, poolId
        );

        // Check the message type prefix
        assertEq(uint8(encoded[0]), 0); // MsgType.CreatePool
        // Optionally, decode and check the rest of the fields
        // (You can use abi.decode on encoded[1:] if you want to check the struct)
        assertGt(encoded.length, 1);
    }

    function testEncodePlaceBet() public {
        address authority = address(0x1234);
        uint64 poolId = 99;
        uint8 option = 1;
        uint64 amount = 1000;
        bytes memory encoded = BetlifyMsgCodec.encodePlaceBet(authority, poolId, option, amount);
        assertEq(uint8(encoded[0]), 1); // MsgType.PlaceBet
        assertGt(encoded.length, 1);
    }

    function testEncodeResolveMarket() public {
        uint64 poolId = 99;
        uint8 winningOption = 1;
        bytes memory encoded = BetlifyMsgCodec.encodeResolveMarket(poolId, winningOption);
        assertEq(uint8(encoded[0]), 2); // MsgType.ResolveMarket
        assertGt(encoded.length, 1);
    }

    function testEncodeClaimWinnings() public {
        uint64 poolId = 99;
        bytes memory encoded = BetlifyMsgCodec.encodeClaimWinnings(poolId);
        assertEq(uint8(encoded[0]), 3); // MsgType.ClaimWinnings
        assertGt(encoded.length, 1);
    }

    // TODO: Add round-trip decode tests if/when decode functions are implemented
} 