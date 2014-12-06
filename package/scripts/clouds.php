<?php

require "aps/2/runtime.php";

/**
 * Class cloud presents application and its global parameters
 * @type("http://aps-standard.org/samples/basic/cloud/1.0")
 * @implements("http://aps-standard.org/types/core/application/1.0")
 */
class cloud extends APS\ResourceBase {
# Link to collection of contexts. Pay attention to [] brackets at the end of the @link line.
	/**
	 * @link("http://aps-standard.org/samples/basic/context/1.0[]")
	 */
	public $contexts;

# Global connection settings will be configured by the provider
# Must be forwarded to the app end-point to set the connection with the external system
	/**
        * @type(string)
        * @title("apphost")
        * @description("Cloud management server IP or domain name")
        */
        public $apphost;
        
        /**
        * @type(string)
        * @title("Cloud Admin")
        * @description("Cloud administrator")
        */
        public $cloudadmin;

        /**
        * @type(string)
        * @title("Cloud Password")
        * @description("Cloud administrator password")
        * @encrypted
        */
        public $cloudpass;

}
