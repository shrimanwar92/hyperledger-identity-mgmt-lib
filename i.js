const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
const IdCard = require('composer-common').IdCard;
const path = require('path');
const config = require('config');

var businessNetworkConnection = new BusinessNetworkConnection();
const adminConnection = new AdminConnection();
const businessNetworkCardStore = new BusinessNetworkCardStore();

const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-filesystem' } );
var NS = 'org.example.biznet';

var issueIdentity = async () => {
    try {
        await businessNetworkConnection.connect("admin@test");
        // Get the factory for the business network.
        let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
        // Create the participants, Provide unique entries only
        let id = `${Math.floor(Math.random()*90000) + 10000}`;
        let participant = factory.newResource(NS, 'SampleParticipant', id);
        participant.firstName = "test";
        participant.lastName = "test";

        let participantRegistry = await businessNetworkConnection.getParticipantRegistry(NS + '.SampleParticipant');
        await participantRegistry.add(participant);
            
        return await businessNetworkConnection.issueIdentity(NS + '.SampleParticipant#'+ id, id);
    } catch (err) {
        console.log("Error in issueIdentity : " + err);
        throw err;
    } 
};


var importCardForIdentity = async (cardName, identity) => {
    let connectionProfile = config;
    connectionProfile.name = config.get('name');

    const metadata = {
        userName: identity.userID,
        version: 1,
        enrollmentSecret: identity.userSecret,
        businessNetwork: 'test'
    };

    const card = new IdCard(metadata, connectionProfile);
    return await adminConnection.importCard(cardName, card);
};

async function useIdentity(cardName) {
    await businessNetworkConnection.disconnect();
    businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

    return await businessNetworkConnection.connect(cardName);
}

async function setup() {
    let identity = await issueIdentity();
    let i = await importCardForIdentity(`${identity.userID}@test`, identity);
    let use = await useIdentity(`${identity.userID}@test`)
    console.log(use);
}


setup();
