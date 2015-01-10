<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/calendar/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 * @access(referrer,true)
 */
class calendar extends \APS\ResourceBase {
    /**
     * @type(string)
     * @final
     */
    public $googleId;

    /**
     * @type(string)
     * @required
     */
    public $name;

    /**
     * @type(string)
     */
    public $description;

    /**
     * @type(string)
     * @required
     */
    public $timezone;

    /**
     * @link("http://aps.google.com/gcalendar/context/1.0")
     * @required
     */
    public $context;

    /**
     * @link("http://aps-standard.org/types/core/service-user/1.0")
     * @required
     */
    public $owner;

    /**
     * @link("http://aps.google.com/gcalendar/event/1.0[]")
     */
    public $events;

    public function provision() {
        $c = new Google_Service_Calendar_Calendar();
        $c->setSummary($this->name);
        $c->setDescription($this->description);
        $c->setTimeZone($this->timezone);
        $l = \APS\Logger::get();
        $l->debug('Creating calendar...');
        $l->debug(print_r($c, true));
        $this->googleId = getService($this->context->globals)->calendars->insert($c)->getId();       
    }

    public function configure($new) {
    }

    public function unprovision() {
        $l = \APS\Logger::get();
        $l->debug('Deleting calendar...');
        $l->debug(print_r($this, true));
        getService($this->context->globals)->calendars->delete($this->googleId);
    }

    /**
    * @verb(POST)
    * @path("/scheduleEvent")
    * @param("http://aps.google.com/gcalendar/event/1.0#event",body)
    */
    public function scheduleEvent($event) {
        $event = json_decode($event);
        $new = \APS\TypeLibrary::newResourceByTypeId('http://aps.google.com/gcalendar/event/1.0');
        $new->summary = $event->summary;
        $new->description = $event->description;
        $new->location = $event->location;
        $new->timezone = $event->timezone;
        $new->start = $event->start;
        $new->end = $event->end;
        $new->attendees = $event->attendees;
        $new->reminders = $event->reminders;
        $new->calendar = $this;
        \APS\Request::getController()->impersonate($this)->provisionResource($new);
    }

    /**
    * @verb(GET)
    * @path("/getEvent")
    * @param(string,path)
    * @return("http://aps.google.com/gcalendar/event/1.0#event",application/json)
    */
    public function getEvent($id = null) {
    	if (is_null($id)) {

    	} else {

    	}
    }

    /**
    * @verb(GET)
    * @path("/listEvents")
    * @return("http://aps.google.com/gcalendar/event/1.0#event[]",application/json)
    */
    public function listEvents() {
    	return $this->getEvent();
    }

    /**
    * @verb(POST)
    * @path("/cancelEvent")
    * @param(string,path)
    */
    public function cancelEvent($id) {

    }
}

