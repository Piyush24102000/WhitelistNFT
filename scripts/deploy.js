const hre = require("hardhat");
require("dotenv").config({ path: ".env" });
const { contract_address, metdata_url } = require("../constants")
async function main() {

  const whitelistContract = contract_address;
  const metadataURL = metdata_url;


  const Lock = await hre.ethers.getContractFactory("TechBull");
  const lock = await Lock.deploy(metadataURL, whitelistContract); //Constructor parameters

  await lock.deployed();

  console.log("TechBull  deployed to:", lock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
