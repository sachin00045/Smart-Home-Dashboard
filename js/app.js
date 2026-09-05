/* =========================================================
   SMART HOME DASHBOARD
   ========================================================= */

/* =========================================================
   DEFAULT DATA
   ========================================================= */

const DEFAULT_DEVICES = [
  {
    id: 1,
    name: "Living Room Lights",
    room: "Living Room",
    type: "Light",
    power: 60,
    active: true,
    icon: "💡"
  },
  {
    id: 2,
    name: "Air Conditioner",
    room: "Living Room",
    type: "AC",
    power: 1200,
    active: false,
    icon: "❄️"
  },
  {
    id: 3,
    name: "Front Door Lock",
    room: "Security",
    type: "Security",
    power: 5,
    active: true,
    icon: "🔒"
  }
];

const DEFAULT_ROOMS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Security"
];


/* =========================================================
   DOM
   ========================================================= */

const deviceList =
  document.getElementById("deviceList");

const deviceListPage =
  document.getElementById("deviceListPage");

const addDeviceButton =
  document.getElementById("addDeviceButton");

const addDeviceButtonPage =
  document.getElementById("addDeviceButtonPage");

const roomGrid =
  document.getElementById("roomGrid");

const roomGridPage =
  document.getElementById("roomGridPage");

const addRoomButton =
  document.getElementById("addRoomButton");

const addRoomButtonPage =
  document.getElementById("addRoomButtonPage");

const searchInput =
  document.getElementById("searchInput");

const deviceCount =
  document.getElementById("deviceCount");

const currentPower =
  document.getElementById("currentPower");

const temperatureValue =
  document.getElementById("temperatureValue");

const temperatureSlider =
  document.getElementById("temperatureSlider");

const temperatureStat =
  document.getElementById("temperatureStat");

const powerMeterFill =
  document.getElementById("powerMeterFill");

const powerLoadText =
  document.getElementById("powerLoadText");

const powerLoadMessage =
  document.getElementById("powerLoadMessage");

const toast =
  document.getElementById("toast");

const navItems =
  document.querySelectorAll(".nav-item");


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const DEVICE_STORAGE =
  "smartHomeDevices";

const ROOM_STORAGE =
  "smartHomeRooms";

const TEMP_STORAGE =
  "smartHomeTemperature";

const MODE_STORAGE =
  "smartHomeMode";


/* =========================================================
   VARIABLES
   ========================================================= */

let devices = [];

let rooms = [];

let selectedRoom = null;

let currentPage = "Dashboard";


/* =========================================================
   SAVE DEVICES
   ========================================================= */

function saveDevices() {
  localStorage.setItem(
    DEVICE_STORAGE,
    JSON.stringify(devices)
  );
}


/* =========================================================
   LOAD DEVICES
   ========================================================= */

function loadDevices() {

  const saved =
    localStorage.getItem(DEVICE_STORAGE);

  if (!saved) {

    devices =
      JSON.parse(
        JSON.stringify(DEFAULT_DEVICES)
      );

    saveDevices();

    return;
  }

  try {

    const parsed =
      JSON.parse(saved);

    if (Array.isArray(parsed)) {

      devices = parsed.map(device => ({

        id: device.id,

        name: device.name || "Unnamed Device",

        room: device.room || "Living Room",

        type: device.type || "Other",

        power: Number(device.power) || 0,

        /*
         * IMPORTANT:
         * Convert saved value back to boolean.
         */
        active:
          device.active === true ||
          device.active === "true",

        icon: device.icon || "⚙️"

      }));

    } else {

      throw new Error("Invalid device data");

    }

  } catch {

    devices =
      JSON.parse(
        JSON.stringify(DEFAULT_DEVICES)
      );

    saveDevices();
  }
}


/* =========================================================
   SAVE ROOMS
   ========================================================= */

function saveRooms() {

  localStorage.setItem(
    ROOM_STORAGE,
    JSON.stringify(rooms)
  );
}


/* =========================================================
   LOAD ROOMS
   ========================================================= */

function loadRooms() {

  const saved =
    localStorage.getItem(ROOM_STORAGE);

  if (!saved) {

    rooms =
      [...DEFAULT_ROOMS];

  } else {

    try {

      const parsed =
        JSON.parse(saved);

      rooms =
        Array.isArray(parsed)
          ? parsed
          : [...DEFAULT_ROOMS];

    } catch {

      rooms =
        [...DEFAULT_ROOMS];

    }
  }


  /*
   * If a device belongs to a room that
   * doesn't exist yet, automatically create it.
   */

  devices.forEach(device => {

    if (
      device.room &&
      !rooms.includes(device.room)
    ) {

      rooms.push(device.room);

    }

  });

  saveRooms();
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);
}


/* =========================================================
   DEVICE FILTER
   ========================================================= */

function getFilteredDevices() {

  let result =
    [...devices];


  /* ROOM FILTER */

  if (selectedRoom) {

    result =
      result.filter(
        device =>
          device.room === selectedRoom
      );

  }


  /* SEARCH FILTER */

  if (
    searchInput &&
    searchInput.value.trim()
  ) {

    const search =
      searchInput.value
        .toLowerCase()
        .trim();

    result =
      result.filter(device =>

        device.name
          .toLowerCase()
          .includes(search)

        ||

        device.room
          .toLowerCase()
          .includes(search)

        ||

        device.type
          .toLowerCase()
          .includes(search)

      );

  }

  return result;
}


/* =========================================================
   DEVICE CARD
   ========================================================= */

function createDeviceCard(device) {

  const card =
    document.createElement("div");

  card.className =
    "device-card";

  card.dataset.id =
    device.id;


  card.innerHTML = `

    <div class="device-icon">
      ${device.icon || "⚙️"}
    </div>

    <div class="device-info">

      <h3>
        ${device.name}
      </h3>

    </div>

    <button
      class="toggle ${device.active ? "active" : ""}"
      data-id="${device.id}"
      type="button"
      aria-label="Toggle ${device.name}">
    </button>

    <button
      class="delete-device"
      data-delete="${device.id}"
      type="button"
      title="Delete device">
      🗑
    </button>

  `;

  return card;
}


/* =========================================================
   RENDER DEVICES
   ========================================================= */

function renderDevices() {

  const filteredDevices =
    getFilteredDevices();


  /*
   * DASHBOARD DEVICE LIST
   */

  if (deviceList) {

    deviceList.innerHTML = "";


    if (
      filteredDevices.length === 0
    ) {

      deviceList.innerHTML = `

        <div class="empty-state">

          <div>🏠</div>

          <h3>
            No devices in this room
          </h3>

          <p>
            ${
              selectedRoom
                ? `Add a device to ${selectedRoom}.`
                : "Add your first device."
            }
          </p>

        </div>

      `;

    } else {

      filteredDevices.forEach(device => {

        deviceList.appendChild(
          createDeviceCard(device)
        );

      });

    }

  }


  /*
   * DEVICES PAGE
   */

  if (deviceListPage) {

    deviceListPage.innerHTML = "";


    if (
      filteredDevices.length === 0
    ) {

      deviceListPage.innerHTML = `

        <div class="empty-state">

          <div>🏠</div>

          <h3>
            No devices found
          </h3>

          <p>
            ${
              selectedRoom
                ? `No devices are currently assigned to ${selectedRoom}.`
                : "Add your first device."
            }
          </p>

        </div>

      `;

    } else {

      filteredDevices.forEach(device => {

        deviceListPage.appendChild(
          createDeviceCard(device)
        );

      });

    }

  }


  updateStats();
}


/* =========================================================
   DEVICE EVENTS
   ========================================================= */

function setupDeviceEvents(container) {

  if (!container) return;

  container.addEventListener(
    "click",
    event => {

      const toggle =
        event.target.closest(".toggle");

      if (toggle) {

        event.stopPropagation();

        toggleDevice(
          Number(toggle.dataset.id)
        );

        return;
      }


      const deleteButton =
        event.target.closest(".delete-device");

      if (deleteButton) {

        event.stopPropagation();

        deleteDevice(
          Number(
            deleteButton.dataset.delete
          )
        );

      }

    }
  );
}


/* =========================================================
   TOGGLE DEVICE
   ========================================================= */

function toggleDevice(id) {

  const device =
    devices.find(
      item => item.id === id
    );

  if (!device) return;


  /*
   * Change state
   */

  device.active =
    !device.active;


  /*
   * SAVE IMMEDIATELY
   */

  saveDevices();


  /*
   * Update everything
   */

  renderDevices();

  renderRooms();

  updateStats();


  /*
   * Visual selected effect
   */

  setTimeout(() => {

    document
      .querySelectorAll(
        `.device-card[data-id="${id}"]`
      )
      .forEach(card => {

        card.classList.add(
          "selected"
        );

        setTimeout(() => {

          card.classList.remove(
            "selected"
          );

        }, 500);

      });

  }, 20);


  showToast(
    `${device.name} ${
      device.active
        ? "turned ON"
        : "turned OFF"
    }`
  );
}


/* =========================================================
   DELETE DEVICE
   ========================================================= */

function deleteDevice(id) {

  const device =
    devices.find(
      item => item.id === id
    );

  if (!device) return;


  if (
    !confirm(
      `Delete "${device.name}"?`
    )
  ) {
    return;
  }


  devices =
    devices.filter(
      item => item.id !== id
    );


  saveDevices();

  renderDevices();

  renderRooms();

  updateStats();


  showToast(
    `${device.name} deleted`
  );
}


/* =========================================================
   ADD DEVICE
   ========================================================= */

function addDevice() {

  const name =
    prompt(
      "Enter device name:"
    );


  if (
    !name ||
    !name.trim()
  ) {
    return;
  }


  /*
   * ROOM
   */

  const roomList =
    rooms
      .map(
        (room, index) =>
          `${index + 1}. ${room}`
      )
      .join("\n");


  const defaultRoomNumber =
    selectedRoom
      ? rooms.indexOf(selectedRoom) + 1
      : 1;


  const roomChoice =
    prompt(
      `Choose a room:\n\n${roomList}\n\nEnter room number:`,
      defaultRoomNumber
    );


  const roomIndex =
    Number(roomChoice) - 1;


  if (
    !Number.isInteger(roomIndex) ||
    roomIndex < 0 ||
    roomIndex >= rooms.length
  ) {

    showToast(
      "Invalid room"
    );

    return;
  }


  const room =
    rooms[roomIndex];


  /*
   * TYPE
   */

  const type =
    prompt(
      "Enter device type:\n\nLight / AC / Fan / TV / Security / Other",
      "Other"
    );


  if (
    !type ||
    !type.trim()
  ) {
    return;
  }


  /*
   * POWER
   */

  const powerInput =
    prompt(
      "Enter power consumption in watts:",
      "100"
    );


  const power =
    Number(powerInput);


  if (
    !Number.isFinite(power) ||
    power < 0
  ) {

    showToast(
      "Invalid power value"
    );

    return;
  }


  /*
   * ICON
   */

  const lowerType =
    type
      .trim()
      .toLowerCase();

  let icon =
    "⚙️";


  if (
    lowerType.includes("light")
  ) {

    icon = "💡";

  } else if (
    lowerType.includes("ac") ||
    lowerType.includes("air")
  ) {

    icon = "❄️";

  } else if (
    lowerType.includes("fan")
  ) {

    icon = "🌀";

  } else if (
    lowerType.includes("tv")
  ) {

    icon = "📺";

  } else if (
    lowerType.includes("security") ||
    lowerType.includes("lock")
  ) {

    icon = "🔒";

  }


  /*
   * CREATE DEVICE
   */

  const newDevice = {

    id:
      Date.now(),

    name:
      name.trim(),

    room:
      room,

    type:
      type.trim(),

    power:
      power,

    active:
      false,

    icon:
      icon

  };


  devices.push(
    newDevice
  );


  /*
   * SAVE NEW DEVICE
   */

  saveDevices();


  /*
   * SELECT ITS ROOM
   */

  selectedRoom =
    room;


  /*
   * UPDATE UI
   */

  renderRooms();

  renderDevices();

  updateStats();


  /*
   * Open devices page
   */

  showPage(
    "Devices"
  );


  showToast(
    `${newDevice.name} added to ${room}`
  );
}


/* =========================================================
   ADD DEVICE BUTTONS
   ========================================================= */

if (addDeviceButton) {

  addDeviceButton.addEventListener(
    "click",
    addDevice
  );

}

if (addDeviceButtonPage) {

  addDeviceButtonPage.addEventListener(
    "click",
    addDevice
  );

}


/* =========================================================
   ROOM CARD
   ========================================================= */

function createRoomCard(room) {

  const card =
    document.createElement("div");

  card.className =
    "room-card";

  if (
    selectedRoom === room
  ) {

    card.classList.add(
      "selected"
    );

  }

  card.dataset.room =
    room;


  const roomDevices =
    devices.filter(
      device =>
        device.room === room
    );


  const activeDevices =
    roomDevices.filter(
      device =>
        device.active
    );


  let icon =
    "🏠";


  if (
    room === "Living Room"
  ) {

    icon = "🛋️";

  } else if (
    room === "Bedroom"
  ) {

    icon = "🛏️";

  } else if (
    room === "Kitchen"
  ) {

    icon = "🍳";

  } else if (
    room === "Security"
  ) {

    icon = "🔒";

  }


  card.innerHTML = `

    <div class="room-top">

      <span>
        ${icon}
      </span>

      <span class="status ${
        activeDevices.length
          ? "on"
          : ""
      }">

        ${
          activeDevices.length
            ? `${activeDevices.length} active`
            : "All off"
        }

      </span>

    </div>

    <h3>
      ${room}
    </h3>

    <p>
      ${roomDevices.length}
      ${
        roomDevices.length === 1
          ? "device"
          : "devices"
      }
    </p>

  `;


  return card;
}


/* =========================================================
   RENDER ROOMS
   ========================================================= */

function renderRooms() {

  const containers = [
    roomGrid,
    roomGridPage
  ];


  containers.forEach(
    container => {

      if (!container) return;

      container.innerHTML = "";


      rooms.forEach(room => {

        container.appendChild(
          createRoomCard(room)
        );

      });

    }
  );


  updateStats();
}


/* =========================================================
   ROOM EVENTS
   ========================================================= */

function setupRoomEvents(container) {

  if (!container) return;


  container.addEventListener(
    "click",
    event => {

      const card =
        event.target.closest(
          ".room-card"
        );

      if (!card) return;


      selectedRoom =
        card.dataset.room;


      renderRooms();

      renderDevices();


      showPage(
        "Devices"
      );


      showToast(
        `${selectedRoom} selected`
      );

    }
  );
}


/* =========================================================
   ADD ROOM
   ========================================================= */

function addRoom() {

  const roomName =
    prompt(
      "Enter new room name:"
    );


  if (
    !roomName ||
    !roomName.trim()
  ) {
    return;
  }


  const cleanName =
    roomName.trim();


  const exists =
    rooms.some(
      room =>
        room.toLowerCase() ===
        cleanName.toLowerCase()
    );


  if (exists) {

    showToast(
      "Room already exists"
    );

    return;
  }


  rooms.push(
    cleanName
  );


  saveRooms();


  selectedRoom =
    cleanName;


  renderRooms();

  renderDevices();


  showPage(
    "Devices"
  );


  showToast(
    `${cleanName} created`
  );
}


/* =========================================================
   ADD ROOM BUTTONS
   ========================================================= */

if (addRoomButton) {

  addRoomButton.addEventListener(
    "click",
    addRoom
  );

}

if (addRoomButtonPage) {

  addRoomButtonPage.addEventListener(
    "click",
    addRoom
  );

}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

  /*
   * TOTAL DEVICES
   */

  if (deviceCount) {

    deviceCount.textContent =
      devices.length;

  }


  /*
   * ACTIVE DEVICES
   */

  const activeDevices =
    devices.filter(
      device =>
        device.active
    );


  /*
   * CURRENT POWER
   *
   * Only active devices contribute.
   */

  const totalPower =
    activeDevices.reduce(
      (total, device) =>
        total +
        Number(device.power || 0),
      0
    );


  if (currentPower) {

    currentPower.textContent =
      `${totalPower} W`;

  }


  /*
   * POWER PERCENTAGE
   */

  const maxPower =
    3000;


  const percentage =
    Math.min(
      Math.round(
        (totalPower / maxPower) * 100
      ),
      100
    );


  if (powerMeterFill) {

    powerMeterFill.style.width =
      `${percentage}%`;

  }


  if (powerLoadText) {

    powerLoadText.textContent =
      `${percentage}%`;

  }


  /*
   * POWER MESSAGE
   */

  if (powerLoadMessage) {

    if (
      totalPower === 0
    ) {

      powerLoadMessage.textContent =
        "No active devices";

    } else if (
      totalPower < 1000
    ) {

      powerLoadMessage.textContent =
        "Low power usage";

    } else if (
      totalPower < 2000
    ) {

      powerLoadMessage.textContent =
        "Moderate power usage";

    } else {

      powerLoadMessage.textContent =
        "High power usage";

    }

  }
}


/* =========================================================
   TEMPERATURE
   ========================================================= */

function loadTemperature() {

  const saved =
    localStorage.getItem(
      TEMP_STORAGE
    );


  let temperature =
    Number(saved);


  if (
    !Number.isFinite(temperature) ||
    temperature < 16 ||
    temperature > 30
  ) {

    temperature = 24;

  }


  if (temperatureSlider) {

    temperatureSlider.value =
      temperature;

  }


  if (temperatureValue) {

    temperatureValue.textContent =
      `${temperature}°C`;

  }


  if (temperatureStat) {

    temperatureStat.textContent =
      `${temperature}°C`;

  }


  localStorage.setItem(
    TEMP_STORAGE,
    temperature
  );
}


if (temperatureSlider) {

  temperatureSlider.addEventListener(
    "input",
    () => {

      const temperature =
        Number(
          temperatureSlider.value
        );


      if (temperatureValue) {

        temperatureValue.textContent =
          `${temperature}°C`;

      }


      if (temperatureStat) {

        temperatureStat.textContent =
          `${temperature}°C`;

      }


      /*
       * SAVE IMMEDIATELY
       */

      localStorage.setItem(
        TEMP_STORAGE,
        temperature
      );

    }
  );
}


/* =========================================================
   SCENES
   ========================================================= */

function activateScene(mode) {

  const normalized =
    mode
      .toLowerCase()
      .trim();


  /* =====================================================
     MORNING
     ===================================================== */

  if (
    normalized.includes("morning")
  ) {

    devices.forEach(
      device => {

        const type =
          device.type
            .toLowerCase();


        /*
         * Lights ON
         */

        if (
          type.includes("light")
        ) {

          device.active =
            true;

        }


        /*
         * AC / FAN OFF
         */

        else if (
          type.includes("ac") ||
          type.includes("air") ||
          type.includes("fan")
        ) {

          device.active =
            false;

        }

      }
    );


    localStorage.setItem(
      MODE_STORAGE,
      "Morning mode"
    );


    saveDevices();

    renderDevices();

    renderRooms();

    updateStats();

    updateSceneButtons(
      "Morning mode"
    );


    showToast(
      "☀️ Morning mode activated"
    );

    return;
  }


  /* =====================================================
     GOOD NIGHT
     ===================================================== */

  if (
    normalized.includes("night")
  ) {

    devices.forEach(
      device => {

        const type =
          device.type
            .toLowerCase();


        /*
         * TURN NORMAL DEVICES OFF
         */

        if (
          type.includes("light") ||
          type.includes("ac") ||
          type.includes("air") ||
          type.includes("fan") ||
          type.includes("tv")
        ) {

          device.active =
            false;

        }


        /*
         * SECURITY STAYS ON
         */

        else if (
          type.includes("security") ||
          type.includes("lock")
        ) {

          device.active =
            true;

        }

      }
    );


    localStorage.setItem(
      MODE_STORAGE,
      "Good Night"
    );


    saveDevices();

    renderDevices();

    renderRooms();

    updateStats();

    updateSceneButtons(
      "Good Night"
    );


    showToast(
      "🌙 Good Night activated"
    );

    return;
  }
}


/* =========================================================
   SCENE BUTTON VISUAL STATE
   ========================================================= */

function updateSceneButtons(mode) {

  document
    .querySelectorAll(
      ".scene-buttons button"
    )
    .forEach(button => {

      const text =
        button.textContent
          .toLowerCase()
          .trim();


      if (
        mode === "Morning mode" &&
        text.includes("morning")
      ) {

        button.classList.add(
          "active-mode"
        );

      } else if (
        mode === "Good Night" &&
        text.includes("night")
      ) {

        button.classList.add(
          "active-mode"
        );

      } else {

        button.classList.remove(
          "active-mode"
        );

      }

    });
}


/* =========================================================
   SCENE BUTTON EVENTS
   ========================================================= */

document
  .querySelectorAll(
    ".scene-buttons button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const text =
          button.textContent
            .toLowerCase()
            .trim();


        if (
          text.includes("morning")
        ) {

          activateScene(
            "Morning mode"
          );

        } else if (
          text.includes("night")
        ) {

          activateScene(
            "Good Night"
          );

        }

      }
    );

  });


/* =========================================================
   LOAD SAVED SCENE
   ========================================================= */

function loadScene() {

  const savedMode =
    localStorage.getItem(
      MODE_STORAGE
    );


  if (!savedMode) return;


  updateSceneButtons(
    savedMode
  );
}


/* =========================================================
   SEARCH
   ========================================================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      renderDevices();

    }
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageName) {

  currentPage =
    pageName;


  document
    .querySelectorAll(
      ".page-section"
    )
    .forEach(section => {

      const isPage =
        section.dataset.page ===
        pageName;


      section.classList.toggle(
        "active",
        isPage
      );


      section.hidden =
        !isPage;

    });


  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.page ===
      pageName
    );

  });


  /*
   * IMPORTANT:
   * Devices page always renders
   * using selected room.
   */

  if (
    pageName === "Devices"
  ) {

    renderDevices();

  }


  if (
    pageName === "Rooms"
  ) {

    renderRooms();

  }
}


/* =========================================================
   NAV EVENTS
   ========================================================= */

navItems.forEach(
  item => {

    item.addEventListener(
      "click",
      event => {

        event.preventDefault();


        const page =
          item.dataset.page;


        if (!page) return;


        showPage(
          page
        );

      }
    );

  }
);


/* =========================================================
   RESET DATA
   ========================================================= */

const resetDataButton =
  document.getElementById(
    "resetDataButton"
  );


if (resetDataButton) {

  resetDataButton.addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "Reset all Smart Home data?"
        )
      ) {

        return;

      }


      localStorage.removeItem(
        DEVICE_STORAGE
      );

      localStorage.removeItem(
        ROOM_STORAGE
      );

      localStorage.removeItem(
        TEMP_STORAGE
      );

      localStorage.removeItem(
        MODE_STORAGE
      );


      devices =
        JSON.parse(
          JSON.stringify(
            DEFAULT_DEVICES
          )
        );


      rooms =
        [...DEFAULT_ROOMS];


      selectedRoom =
        null;


      saveDevices();

      saveRooms();

      loadTemperature();

      renderRooms();

      renderDevices();

      updateStats();

      updateSceneButtons("");


      showToast(
        "Dashboard reset successfully"
      );

    }
  );
}


/* =========================================================
   DATE & TIME
   ========================================================= */

function updateTime() {

  const dateTime =
    document.getElementById(
      "dateTime"
    );


  if (!dateTime) return;


  const now =
    new Date();


  dateTime.textContent =
    now.toLocaleString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );
}


/* =========================================================
   START APPLICATION
   ========================================================= */

loadDevices();

loadRooms();

loadTemperature();

loadScene();


setupDeviceEvents(
  deviceList
);

setupDeviceEvents(
  deviceListPage
);


setupRoomEvents(
  roomGrid
);

setupRoomEvents(
  roomGridPage
);


renderRooms();

renderDevices();

updateStats();

updateTime();


showPage(
  "Dashboard"
);


setInterval(
  updateTime,
  1000
);