<?php

require_once 'aps/2/runtime.php';
require_once 'api-client/autoload.php';

define('APS_DEVELOPMENT_MODE', 'on');

function getServices($globals) {
	$l = \APS\Logger::get();
	static $services = null;
	if ($services !== null)
		return $services;
	$client = new Google_Client();
	$client->setApplicationName("Client_Library_Examples");
	$services = array('calendar' => new Google_Service_Calendar($client), 'mail' => new Google_Service_Gmail($client));
	$creds = new Google_Auth_AssertionCredentials($globals->serviceAccountName, array('https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.compose'), base64_decode(file_get_contents($globals->serviceAccountName)));
	$client->setAssertionCredentials($creds);
	if ($client->getAuth()->isAccessTokenExpired()) {
		$l->debug('Requesting new token...');
		$client->getAuth()->refreshTokenWithAssertion($creds);
	}
	return $services;
}

\APS\Logger::get()->setLogFile("log");
