import axios from 'axios';
import {factories} from '@strapi/strapi';

export default factories.createCoreController('api::produit.produit', ({strapi}) => ({
    async find(ctx) {
        try {
            const res = await axios.get(
                'https://api.airtable.com/v0/appBEXBO3G9kJ2bga/Produits',
                {
                    headers: {
                        Authorization: `Bearer patXEDvOirByjd3aT.14a47a9e80520f93529731d4f81af26b7fbca0c2b7263ddef4ff32e0f3345697`,
                    },
                }
            );

            return res.data.records.map((r) => ({
                id: r.id,
                ...r.fields,
            }));
        } catch (error) {
            strapi.log.error('Erreur Airtable:', error.message);
            ctx.throw(500, 'Impossible de récupérer les produits depuis Airtable');
        }
    },
}));
