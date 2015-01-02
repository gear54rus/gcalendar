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

	}	

	public function configure() {

	}

	public function unprovision() {
		getService($this->calendar->context->globals)->events->delete($calendar->googleId, $this->googleId, true);
	}
}


