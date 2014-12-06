<?php

require "aps/2/runtime.php";

// Definition of type structures

class CPU {
	/**
	 * @type("integer")
	 * @title("Number of CPUs")
	 * @description("Number of CPU cores")
	 */
	public $number;
}

class OS {
	/**
	 * @type("string")
	 * @title("OS Name")
	 * @description("Operating System Name")
	 */
	public $name;

	/**
	 * @type("string")
	 * @title("OS Version")
	 * @description("Operating System version")
	 */
	public $version;
}

class Hardware {
	/**
	 * @type("integer")
	 * @title("RAM Size")
	 * @description("RAM size in GB")
	 */
	public $memory;

	/**
	 * @type("integer")
	 * @title("Disk Space")
	 * @description("Disk space in GB")
	 */
	public $diskspace;
	
	/**
	 * @type("boolean")
	 * @title("VM with separate OS core or Container using shared OS core")
	 * @description("VM requires more time for provisioning - async POST")
	 */
	public $VM;
	
	/**
	 * @type("CPU")
	 * @title("CPU")
	 * @description("Server CPU parameters")
	 */
	public $CPU;
}

class Platform {
	/**
	 * @type("string")
	 * @title("Architecture")
	 * @description("Platform architecture")
	 */
	public $arch;

	/**
	 * @type("OS")
	 * @title("OS Parameters")
	 * @description("Parameters of operating system")
	 */
	public $OS;
}


// Main class
/**
 * @type("http://aps-standard.org/samples/basic/vps/1.0")
 * @implements("http://aps-standard.org/types/core/resource/1.0")
 */
class vps extends APS\ResourceBase {
	
	// Relation with the management context
	/**
	 * @link("http://aps-standard.org/samples/basic/context/1.0")
	 * @required
	 */
	public $context;

	// VPS properties
	
	/**
	 * @type("string")
	 * @title("name")
	 * @description("Server Name")
	 */
	public $name;
	
	/**
	 * @type("string")
	 * @title("Description")
	 * @description("Server Description")
	 */
	public $description;
	
	/**
	 * @type("string")
	 * @title("state")
	 * @description("Server State")
	 */
	public $state;
	
	// VPS complex properties (structures) - defined as classes above
	
	/**
	 * @type("Hardware")
	 * @title("Hardware")
	 * @description("Server Hardware")
	 */
	public $hardware;
	
	/**
	 * @type("Platform")
	 * @title("Platform")
	 * @description("OS Platform")
	 */
	public $platform;
	
	/**
	 * @type("integer")
	 * @title("Counter for async operation")
	 * @description("Counts down number of retries for async operation")
	 */
	public $retry;
	
	// Standard CRUD operations:
	// Provision is called when a sync provisioning is requested
	public function provision() {
		// VM requires more time, thus the *async* operation is required
		if (true) {
			$this->state = "Creating"; // VPS state is intermediate
			throw new \Rest\Accepted($this, "Creating VPS", 30); // Returns to APSC code 202 Accepted
		};
	}
	
	public function provisionAsync() {
		$this->retry +=1; 				// Increment the retry counter
		if ($this->retry >= 2) {		// Loop until the 5th retry
			$this->state = "Stopped"; 
			throw new Exception("Exc");	// Finish the Async operation - return 200 OK to APSC
		}
		else {
			throw new \Rest\Accepted($this, "Creating VPS", 30); // Return code 202 Accepted
		}
	}
	
}

