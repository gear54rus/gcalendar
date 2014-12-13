<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/calendar/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 */
class calendar extends \APS\ResourceBase {

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

	}	
	public function unprovision() {

	}
}

