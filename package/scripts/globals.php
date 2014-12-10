<?php

require "aps/2/runtime.php";

/**
 * Class cloud presents application and its global parameters
 * @type("http://aps.google.com/gcalendar/globals/1.0")
 * @implements("http://aps-standard.org/types/core/application/1.0")
 */
class cloud extends APS\ResourceBase {
	/**
        * @type(string)
        * @title("Google API Endpoint")
        * @description("Endpoint URL for Google Calendar")
        * @required        
        */
        public $apiUrl;
        
        /**
        * @type(string)
        * @title("Google API Key")
        * @description("API Key that has access to calendar and mail scopes")
        * @required 
        */
        public $apiKey;

        /**
         * @link("http://aps.google.com/gcalendar/context/1.0[]")
         */
        public $contexts;
}
