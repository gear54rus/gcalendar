<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/context/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 */
class context extends \APS\ResourceBase {
    /**
    * @type(integer)
    * @required
    */
    public $eventTTL

    /**
     * @link("http://aps.google.com/gcalendar/globals/1.0")
     * @required
     */
    public $globals;

    /**
     * @link("http://aps-standard.org/types/core/subscription/1.0")
     * @required
     */
    public $subscription;

    /**
     * @link("http://aps.google.com/gcalendar/calendar/1.0[]")
     */
    public $calendars;

    public function provision() {

    }   

    public function configure() {

    }

    public function unprovision() {

    }
}
