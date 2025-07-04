// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

library BetlifyMsgCodec {
    enum MsgType {
        CreatePool,
        PlaceBet,
        ResolveMarket,
        ClaimWinnings
    }

    function encodeString(string memory s) internal pure returns (bytes memory) {
        bytes memory strBytes = bytes(s);
        return abi.encodePacked(uint32(strBytes.length), strBytes);
    }

    function encodeStringArray(string[] memory arr) internal pure returns (bytes memory) {
        bytes memory out = abi.encodePacked(uint32(arr.length));
        for (uint i = 0; i < arr.length; i++) {
            out = abi.encodePacked(out, encodeString(arr[i]));
        }
        return out;
    }

    function encodeCreatePool(
        string memory question,
        string[] memory options,
        int64 startTime,
        int64 lockTime,
        int64 endTime,
        uint64 poolId
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            uint8(MsgType.CreatePool),
            encodeString(question),
            encodeStringArray(options),
            startTime,
            lockTime,
            endTime,
            poolId
        );
    }

    function encodePlaceBet(
        address authority,
        uint64 poolId,
        uint8 option,
        uint64 amount
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            uint8(MsgType.PlaceBet),
            authority,
            poolId,
            option,
            amount
        );
    }

    function encodeResolveMarket(
        uint64 poolId,
        uint8 winningOption
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            uint8(MsgType.ResolveMarket),
            poolId,
            winningOption
        );
    }

    function encodeClaimWinnings(
        uint64 poolId
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            uint8(MsgType.ClaimWinnings),
            poolId
        );
    }
}
