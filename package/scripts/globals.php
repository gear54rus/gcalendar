<?php

require 'util.php';

/**
 * @type("http://aps.google.com/gcalendar/globals/1.0")
 * @implements("http://aps-standard.org/types/core/application/1.0")
 */
class globals extends \APS\ResourceBase {
    /**
     * @type(string)
     * @title("Service Account Name")
     * @description("Email address for the service account")
     * @pattern("^[0-9]+-[a-z0-9]+@developer.gserviceaccount.com$")
     * @required
     * @headline
     */
    public $serviceAccountName;

    /**
     * @type(string)
     * @title("Private Key")
     * @description("Base64 representation of .p12 private key")
     * @pattern("^[a-zA-Z0-9+\/]+={0,2}$")
     * @required
     */
    public $privateKey;

    /**
     * @link("http://aps.google.com/gcalendar/context/1.0[]")
     */
    public $contexts;

    public function provision() {
        $l = \APS\Logger::get();
        $l->debug('Provisioning globals...');
        $code = file_put_contents($this->serviceAccountName, $this->privateKey);
        if ($code === false) {
            throw new Exception('Unable to store private key. Exit code: '.$code);
        }
        $this->privateKey = 'HIDDEN';
        $this->clearAccount();
    }

    public function configure($new) {
        $l = \APS\Logger::get();
        $l->debug('Configuring globals...');
        if (file_exists($this->serviceAccountName))
            unlink($this->serviceAccountName);
        $this->serviceAccountName = $new->serviceAccountName;
        $this->privateKey = $new->privateKey;
        $code = file_put_contents($this->serviceAccountName, $this->privateKey);
        if (!$code) {
            throw new Exception('Unable to store private key. Exit code: '.$code);
        }
        $this->privateKey = 'HIDDEN';
    }

    public function unprovision() {
        $l = \APS\Logger::get();
        $l->debug('Unprovisioning globals...');
        $this->clearAccount();
        unlink($serviceAccountName);
    }

    private function clearAccount() {
        $s = getService($this);
        $l = \APS\Logger::get();
        $calendarList = $s->calendarList->listCalendarList(array('maxResults' => 250, 'minAccessRole' => 'owner', 'showHidden' => true, 'showDeleted' => true, 'fields' => 'items/id'));
        foreach ($calendarList->getItems() as $v) {
            $l->debug('Deleting '.$v->getId());
            $s->calendars->delete($v->getId());            
        }
    }
}
