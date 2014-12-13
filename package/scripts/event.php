<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/event/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 */
class event extends \APS\ResourceBase {

	/**
     * @link("http://aps.google.com/gcalendar/calendar/1.0")
     * @required
     */
	public $calendar;

	public function provision() {

	}	
	public function unprovision() {

	}
}


