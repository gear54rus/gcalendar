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
        $l = \APS\Logger::get();
        $l->debug('Provisioning calendar');
        $l->debug(print_r($this, true));
        $calendar = new Google_Service_Calendar_Calendar();
        $calendar->setSummary($this->name);
        $calendar->setDescription($this->description);
        $calendar->setTimeZone($this->timezone);
        $this->googleId = getService($this->context->globals)->calendars->insert($calendar)->getId();       
    }

    public function configure($new = null) {
        $l = \APS\Logger::get();
        $l->debug('Configuring calendar');
        $l->debug(print_r($this, true));
        $l->debug(print_r($new, true));
        $service = getService($this->context->globals);
        $calendar = $service->calendars->get($this->googleId);
        $calendar->setSummary($new->name);
        $calendar->setDescription($new->description);
        $calendar->setTimeZone($new->timezone);
    }

    public function unprovision() {
        $l = \APS\Logger::get();
        $l->debug('Unprovisioning calendar');
        $l->debug(print_r($this, true));
        getService($this->context->globals)->calendars->delete($this->googleId);
    }

    /**
    * @verb(POST)
    * @path("/scheduleEvent")
    * @param("http://aps.google.com/gcalendar/event/1.0#event",body)
    */
    public function scheduleEvent($event) {
        $l = \APS\Logger::get();
        $l->debug('Scheduling event');
        $l->debug(print_r($this, true));
        $apsc = \APS\Request::getController()->impersonate($this);
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
        $apsc->linkResource($apsc->linkResource($this, 'events', $new), 'calendar', $this);
    }

    /**
    * @verb(GET)
    * @path("/getEvent")
    * @param(string,query)
    * @return("http://aps.google.com/gcalendar/event/1.0#event",application/json)
    */
    public function getEvent($id) {
        $l = \APS\Logger::get();
        $l->debug('Getting event');
        $event = null;
        foreach($this->events as $v) {
            if ($v->aps->id === $id) {
                $event = $v;
                break;
            }
        }
        if (!$event)
            throw new Exception('Requested event is not part of this calendar!');
        return \APS\Request::getController()->getResource($id);
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
        foreach($this->events as $v) {
            $result[] = \APS\Request::getController()->getResource($v->aps->id);
        }
        return $result;
    }

    /**
    * @verb(POST)
    * @path("/cancelEvent")
    * @param(string,body)
    */
    public function cancelEvent($id) {
        $l = \APS\Logger::get();
        $l->debug('Canceling event');
        $l->debug(print_r($this, true));
        $event = null;
        foreach($this->events as $v) {
            if ($v->aps->id === $id) {
                $event = $v;
                break;
            }
        }
        if (!$event)
            throw new Exception('Requested event is not part of this calendar!');
        \APS\Request::getController()->unprovisionResource($event);
    }
}

