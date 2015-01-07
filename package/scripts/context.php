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
    public $eventTTL;

    /**
    * @type(string)
    * @required
    */
    public $defaultTimezone;

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

    public function _getDefault() {
        return array('eventTTL' => 1440, 'defaultTimezone' => 'Africa/Abidjan');
    }

    public function provision() {

    }   

    public function configure($new) {

    }

    public function unprovision() {

    }
}
