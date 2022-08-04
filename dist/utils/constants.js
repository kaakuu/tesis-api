"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILD_CCP = void 0;
const AppUtil_1 = require("./AppUtil");
exports.BUILD_CCP = [
    {
        organization: 'Org1MSP',
        affiliation: 'org1.department1',
        ca_name: 'ca.org1.example.com',
        run: () => AppUtil_1.buildCCPOrg1(),
    },
    {
        organization: 'Org2MSP',
        ca_name: 'ca.org1.example.com',
        affiliation: 'org2.department1',
        run: () => AppUtil_1.buildCCPOrg2()
    }
];
//# sourceMappingURL=constants.js.map