<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/event/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 * @access(referrer,true) 
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
	public $timeZone;

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
		$event = new Google_Service_Calendar_Event();
		$event->setSummary($this->summary);
		$event->setLocation($this->location);
		$tmp = new Google_Service_Calendar_EventDateTime();
		$tmp->setTimezone($this->timeZone);
		$tmp->setDateTime($this->start);
		$event->setStart($tmp);
		$tmp = new Google_Service_Calendar_EventDateTime();
		$tmp->setTimezone($this->timeZone);
		$tmp->setDateTime($this->end);
		$event->setEnd($tmp);
		$tmp = array();
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
		$event->setGuestsCanSeeOtherGuests(false);
		$event->setGuestsCanInviteOthers(false);
		$this->googleId = getService($this->calendar->context->globals)->events->insert($this->calendar->googleId, $event)->getId();
		\APS\Logger::get()->debug(print_r($this, true));
	}	

	public function configure($new) {

	}

	public function unprovision() {
		getService($this->calendar->context->globals)->events->delete($this->calendar->googleId, $this->googleId, true);
	}
}


