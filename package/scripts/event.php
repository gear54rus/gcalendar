<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/event/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 */
class event extends \APS\ResourceBase {
	/**
     * @type(string)
     * @final
     */
    public $googleId;

	/**
	* @type(string)
	* @required
	*/
	public $summary;

	/**
	* @type(string)
	* @required
	*/
	public $description;

	/**
	* @type(string)
	* @required
	*/
	public $location;

	/**
	* @type(string)
	* @required
	*/
	public $timezone;

	/**
	* @type(string)
	* @required
	*/
	public $start;

	/**
	* @type(string)
	* @required
	*/
	public $end;

	/**
	* @type(string[])
	*/
	public $attendees;

	/**
	* @type(integer[])
	*/
	public $reminders;

	/**
     * @link("http://aps.google.com/gcalendar/calendar/1.0")
     * @required
     */
	public $calendar;

	public function provision() {
		$l = \APS\Logger::get();
		$l->debug('Provisioning event');
		$l->debug(print_r($this, true));
		if (!is_array($this->reminders)) //php runtime bug
            $this->reminders = array();
        if (!is_array($this->attendees))
            $this->attendees = array();
		$event = new Google_Service_Calendar_Event();
		$event->setSummary($this->summary);
		$event->setLocation($this->location);
		$tmp = new Google_Service_Calendar_EventDateTime();
		$tmp->setTimezone($this->timezone);
		$tmp->setDateTime($this->start);
		$event->setStart($tmp);
		$tmp = new Google_Service_Calendar_EventDateTime();
		$tmp->setTimezone($this->timezone);
		$tmp->setDateTime($this->end);
		$event->setEnd($tmp);
		$tmp = array();
		$attendee = new Google_Service_Calendar_EventAttendee();
		$attendee->setResponseStatus('accepted');
		$attendee->setEmail($this->calendar->owner->login);
		$attendee->setDisplayName($this->calendar->owner->displayName);
		$attendee->setOrganizer(true);
		$tmp[] = $attendee;
		foreach($this->attendees as $v) {
			$attendee = new Google_Service_Calendar_EventAttendee();
			$attendee->setResponseStatus('tentative');
			$attendee->setEmail($v);
			$tmp[] = $attendee;			
		}
		$event->setAttendees($tmp);
		$reminders = new Google_Service_Calendar_EventReminders();
		$reminders->setUseDefault(false);
		$tmp = array();		
		foreach($this->reminders as $v) {
			$reminder = new Google_Service_Calendar_EventReminder();
			$reminder->setMethod('email');
			$reminder->setMinutes($v);
			$tmp[] = $reminder;
		}
		$reminders->setOverrides($tmp);
		$event->setReminders($reminders);
		$event->setGuestsCanSeeOtherGuests(true);
		$event->setGuestsCanInviteOthers(false);
		$this->googleId = getService($this->calendar->context->globals)->events->insert($this->calendar->googleId, $event, array('sendNotifications' => true))->getId();
	}	

	public function configure($new = null) {
		throw new Exception('Event is an immutable object!');
	}

	public function unprovision() {
		$l = \APS\Logger::get();
		$l->debug('Unprovisioning event');
		$l->debug(print_r($this, true));
		getService($this->calendar->context->globals)->events->delete($this->calendar->googleId, $this->googleId, array('sendNotifications' => true));
	}
}


