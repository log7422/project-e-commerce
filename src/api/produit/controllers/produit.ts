import axios from 'axios';
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::produit.produit', ({ strapi }) => ({
    async find(ctx) {
        const query = ctx.query;
        const filters = [];

        // In Promo : booléen
        if (query.promo !== undefined) {
            const value = query.promo === 'true' ? 'TRUE()' : 'FALSE()';
            filters.push(`{In Promo} = ${value}`);
        }

        // date = exacte
        if (query.date && typeof query.date === 'string') {
            filters.push(`IS_SAME({date d'ajout}, "${query.date}", 'day')`);
        }

        // date > (après une certaine date)
        if (query.date && query.date['gt']) {
            filters.push(`IS_AFTER({date d'ajout}, "${query.date['gt']}")`);
        }

        // quantite = exact
        if (query.quantite && typeof query.quantite === 'string') {
            filters.push(`{quantite} = ${query.quantite}`);
        }

        // quantite > 0
        if (query.quantite && query.quantite['gt']) {
            filters.push(`{quantite} > ${query.quantite['gt']}`);
        }

        // Construction de la formule Airtable
        const formula = filters.length > 0 ? `AND(${filters.join(',')})` : '';

        const params = new URLSearchParams();
        if (formula) {
            params.append('filterByFormula', formula);
        }
        params.append('sort[0][field]', 'date d\'ajout');
        params.append('sort[0][direction]', 'desc');

        const airtableUrl = `https://api.airtable.com/v0/appBEXBO3G9kJ2bga/Produits?${params.toString()}`;

        try {
            const res = await axios.get(airtableUrl, {
                headers: {
                    Authorization: `Bearer patXEDvOirByjd3aT.14a47a9e80520f93529731d4f81af26b7fbca0c2b7263ddef4ff32e0f3345697`,
                },
            });

            const data = res.data.records.map((r) => ({
                id: r.id,
                ...r.fields,
            }));

            return {
                count: data.length,
                data: data,
            };
        } catch (error) {
            strapi.log.error('Erreur Airtable:', error.message);
            ctx.throw(500, 'Impossible de récupérer les produits depuis Airtable');
        }
    },
}));
