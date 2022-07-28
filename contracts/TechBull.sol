// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract TechBull is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    uint256 public _price = 0.01 ether; //Price of 1 nft
    bool public _paused; //pause function
    uint256 public maxTokenIds = 20; //Total max tokens
    uint256 public tokenIds; //Total tokenIds
    IWhitelist whitelist; //we made whitelist as instance of IWhitelist
    bool public presaleStarted; //check whether Presale started
    uint256 public presaleEnded; //Timestamp of ending Presale

    modifier onlyWhenNotPaused() {
        require(_paused == false, "Contract currently paused");
        _;
    }

    constructor(string memory baseURI, address whitelistContract)
        ERC721("TechBull", "TB")
    {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        //Only owner can start the presale
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale is not running"
        );
        require(whitelist.whitelistedAddresses(msg.sender), "Not whitelisted");
        require(tokenIds < maxTokenIds, "Must be lesser than 20");
        require(msg.value >= _price, "Must be greater than 0.01 ether");
        tokenIds++;
        //Mint NFTs in presale
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet"
        );
        require(tokenIds < maxTokenIds, "Must be lesser than 20");
        require(msg.value >= _price, "Must be greater than 0.01 ether");
        tokenIds++;
        //Mint tokens
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function withdraw() public onlyOwner{
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value:amount}("");
        require(sent,"Failed to send Ether"); 
    }

    receive() external payable{} //without msg.data
    fallback() external payable{}
}
