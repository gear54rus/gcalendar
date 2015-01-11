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
        return array('eventTTL' => 1440, 'defaultTimezone' => 'UTC');
    }

    public function provision() {

    }   

    public function configure($new) {

    }

    public function unprovision() {

    }

    /**
    * @verb(GET)
    * @path("/listEvents")
    * @return("http://aps.google.com/gcalendar/event/1.0#event[]",application/json)
    */
    public function listEvents() {
        $l = \APS\Logger::get();
        $l->debug('Listing events');
        $result = array();
        foreach($this->calendars as $v) {
            foreach($v->events as $v1) {
                $result[] = \APS\Request::getController()->getResource($v1->aps->id);
            }
        }
        return $result;
    }
}
