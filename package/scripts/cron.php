<?php

require 'util.php';

date_default_timezone_set('UTC');

$l = \APS\Logger::get();
$l->debug('Starting event cleanup procedure!');
$instances = \APS\ControllerProxy::listInstances();
if (!count($instances)) {
    $l->debug('No instances found, nothing to remove.');
    exit(0);
}
$apsc = \APS\Request::getController(\APS\ControllerProxy::listInstances()[0]);
$instances = $apsc->getResources('implementing(http://aps.google.com/gcalendar/globals/1.0)');
$now = new DateTime();

foreach($instances as $v) {
    $service = getService($v);
    foreach($v->contexts as $v1) {
        foreach($v1->calendars as $v2) {
            foreach($v2->events as $v3) {
                $end = new DateTime($v3->end, new DateTimeZone($v3->timezone));
                if (($end < $now) && ($end->add(new DateInterval('PT'.$v1->eventTTL.'M')) < $now)) {
                    $l->debug('Silently removing old event:');
                    $l->debug(print_r($v3, true));
                    $l->debug('From calendar:');
                    $l->debug(print_r($v2, true));
                    $service->events->delete($v2->googleId, $v3->googleId, array('sendNotifications' => false));
                    $apsc->unregisterResource($apsc->getResource($v3->aps->id));
                }
            }
        }
    }
}

$l->debug('Finished event cleanup procedure!');
