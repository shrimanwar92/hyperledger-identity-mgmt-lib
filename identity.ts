import { AdminConnection } from 'composer-admin';
import { BusinessNetworkConnection } from 'composer-client';
import { BusinessNetworkDefinition, NetworkCardStoreManager, IdCard, BusinessNetworkCardStore } from 'composer-common';
import * as config from 'config';

class IdentityManager {

	config = config.get('development');
	adminCard = config.get('cardName');
	fileSystemCardStore = new NetworkCardStoreManager();
	businessNetworkConnection = new BusinessNetworkConnection();
	adminConnection = new AdminConnection();
	businessNetworkCardStore = new BusinessNetworkCardStore();

	async issueIdentity(namespace, participantClass, participantResource, id, cardId) {
		try {
			let factory = this.businessNetworkConnection.getBusinessNetwork().getFactory(); // get factory
			await this.businessNetworkConnection.connect(this.adminCard); // connect the admin card
        	// let participant = factory.newResource(namespace, participantClass, participantDetails.id); // Create the participants, Provide unique entries only
			let participantRegistry = await this.businessNetworkConnection.getParticipantRegistry(`${namespace}.${participantClass}`);
        	await participantRegistry.add(participantResource);

        	//issue identity
      		const identity = await this.businessNetworkConnection.issueIdentity(`${namespace}.${participantClass}#${id}`, cardId);
      		return identity;
		} catch (error) {
			return error;
		}
	}
}

new IdentityManager();