const ScholarLedger = artifacts.require("ScholarLedger");

module.exports = function (deployer) {
    deployer.deploy(ScholarLedger);
};