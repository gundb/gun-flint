export default class BaseExtension {

    /**
     *  Register event handlers with Gun, etc.
     * 
     * @returns {void}
     */
    bootstrap() {
        throw "Extensions must implement the `bootstrap` method." 
    }
}