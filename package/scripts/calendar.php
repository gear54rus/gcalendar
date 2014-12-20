<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/calendar/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
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
     * @type(integer)
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
		$calendar = new Google_Service_Calendar_Calendar();
		$calendar->setDescription($this->description);
		$s = getServices()['calendar'];
		$this->googleId = $s->calendars->insert($calendar)->getId();
		//$calendar->
	}	
	public function unprovision() {

	}
}

