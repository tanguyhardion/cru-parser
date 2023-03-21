/** Classe représentant un Parser de fichiers CRU. */
class Parser {

    /**
     * Constructeur de la classe Parser.
     * Initialise les RegEx attendus dans les fichiers CRU.
     * @constructor
     */
    constructor() {
        this.module = /^\+[A-Z]{2,4}(\d{1,2})?[A-Z]?\d?$/;
        this.entries = {
            one: /^1$/,
            type: /^(C|D|T)\d{1,2}$/,
            capacity: /^P=\d{1,3}$/,
            day: /^H=(L|MA|ME|J|V|S)$/,
            time: /^(\d|1\d|2[0-3]):[0-5]\d-(\d|1\d|2[0-3]):[0-5][0-9]$/,
            group: /^[A-Z]([0-9]|[A-Z])?$/,
            room: /^S=[A-Z]{1,3}\d{1,3}$/,
            end: /^\/\/$/
        };
        this.isCru = true;
    }

    /**
     * Parse le texte d'entrée en le tokenisant puis en validant ses tokens.
     *
     * @async
     * @param {string} input - Le texte à parser.
     */
    async parse(input) {
        await this.validate(await this.tokenize(input));
        return this.isCru;
    }

    /**
     * Tokenise le texte d'entrée en un tableau de tokens.
     *
     * @async
     * @param {string} data - Le texte à tokeniser.
     * @returns {Promise<Array>} Le tableau de tokens.
     */
    async tokenize(data) {
        data = await this.replaceAll(data, /(\/\/)/, '~//');
        const separator = /\r\n|\r|,|~| /;
        var tokens = data.split(separator);
        tokens = tokens.filter(value => value);
        return tokens;
    }

    /**
     * Valide les tokens d'entrée en vérifiant leur ordre et leur contenu.
     *
     * Le premier token doit être un module, suivi d'un certain nombre de tokens
     * correspondant au corps d'une ligne. On lit les tokens jusqu'à ce qu'on
     * rencontre un nouveau token de début de module, auquel cas on recommence.
     *
     * @async
     * @param {Array} input - Le tableau de tokens à valider.
     */
    async validate(input) {
        await this.expect(this.module, input);
        while (!this.module.test(input[0]) && input.length > 0) {
            await this.body(input);
        }
        // Si on a encore des tokens et que le fichier est pour l'instant valide, on relance la validation
        if (input.length > 0 && this.isCru) {
            await this.validate(input);
        }
    }

    /**
     * Parcourt le corps d'une ligne et vérifie que les tokens sont bien placés.
     *
     * @async
     * @param {Array} input - Le tableau de tokens à vérifier.
     */
    async body(input) {
        for (var key in this.entries) {
            await this.expect(this.entries[key], input);
        }
    }

    /**
     * Vérifie que le premier token du tableau correspond au pattern attendu.
     *
     * @async
     * @param {RegExp} pattern - Le pattern attendu.
     * @param {Array} input - Le tableau de tokens à vérifier.
     */
    async expect(pattern, input) {
        if (!pattern.test(input.shift())) {
            this.isCru = false;
        }
    }

    /**
     * Remplace toutes les occurences d'un pattern dans une chaîne de caractères.
     *
     * @async
     * @param {string} str - La chaîne de caractères à modifier.
     * @param {RegExp} find - Le pattern à remplacer.
     * @param {string} replace - La chaîne de caractères de remplacement.
     * @returns {Promise<string>} La chaîne de caractères modifiée.
     */
    async replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

}

module.exports = Parser;
