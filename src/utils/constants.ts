import { buildCCPOrg1, buildCCPOrg2 } from './AppUtil';

export const BUILD_CCP = [
    {
        organization: 'Org1MSP',
        affiliation: 'org1.department1',
        ca_name : 'ca.org1.example.com',
        run : () => buildCCPOrg1(),
    },
    {
        organization: 'Org2MSP',
        ca_name : 'ca.org1.example.com',
        affiliation: 'org2.department1',
        run : () => buildCCPOrg2()
    }
];