let player;
let labyrinth = [];
let rows, cols;
const cellSize = 500;  // Increased cell size
let boxTexture, boxTexture2; // Variable to hold the image
let tunnels = [];
const numDroneAudioFiles = 6;
const droneAudioPaths = [];
const droneAudioFiles = [];
const framesPerDrone = 10 * 60; 

const numFxAudioFiles = 3;
const fxAudioPaths = [];
const fxAudioFiles = [];
const framesPerFx = 15 * 60; 

const numPianoAudioFiles = 4;
const pianoAudioPaths = [];
const pianoAudioFiles = [];
const framesPerPiano = 18 * 60;

const numPiano2AudioFiles = 3;
const piano2AudioPaths = [];
const piano2AudioFiles = [];
const framesPerPiano2 = 22 * 60;

const numSpeakerAudioFiles = 5;
const speakerAudioPaths = [];
const speakerAudioFiles = [];
const framesPerSpeaker = 13 * 60;

const numVocalAudioFiles = 5;
const vocalAudioPaths = [];
const vocalAudioFiles = [];
const framesPerVocal = 17 * 60;

for (let i = 0; i < numDroneAudioFiles; i++){
  droneAudioPaths.push(`/audio/drone/0${i+1}.mp3`);
}
for (let i = 0; i < numFxAudioFiles; i++){
  fxAudioPaths.push(`/audio/fx/0${i+1}.mp3`);
}
for (let i = 0; i < numPianoAudioFiles; i++){
  pianoAudioPaths.push(`/audio/piano/0${i+1}.mp3`);
}

for (let i = 0; i < numPiano2AudioFiles; i++){
  piano2AudioPaths.push(`/audio/piano2/0${i+1}.mp3`);
}

for (let i = 0; i < numSpeakerAudioFiles; i++){
  speakerAudioPaths.push(`/audio/speaker/0${i+1}.mp3`);
}

for (let i = 0; i < numVocalAudioFiles; i++){
  vocalAudioPaths.push(`/audio/vocal/0${i+1}.mp3`);
}

function preload() {
  boxTexture = loadImage('4chankamer.png'); 
  boxTexture2 = loadImage('test.gif'); 
  for (let i = 0; i < droneAudioPaths.length; i++) {
    droneAudioFiles[i] = loadSound(droneAudioPaths[i]);
  }
  for (let i = 0; i < fxAudioPaths.length; i++) {
    fxAudioFiles[i] = loadSound(fxAudioPaths[i]);
  }

  for (let i = 0; i < pianoAudioPaths.length; i++) {
    pianoAudioFiles[i] = loadSound(pianoAudioPaths[i]);
  }

  for (let i = 0; i < piano2AudioPaths.length; i++) {
    piano2AudioFiles[i] = loadSound(piano2AudioPaths[i]);
  }

  for (let i = 0; i < speakerAudioPaths.length; i++) {
    speakerAudioFiles[i] = loadSound(speakerAudioPaths[i]);
  }

  for (let i = 0; i < vocalAudioPaths.length; i++) {
    vocalAudioFiles[i] = loadSound(vocalAudioPaths[i]);
  }

}



function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    
    rows = 100; // Define the number of rows
    cols = 100; // Define the number of columns
  
    // Initialize the labyrinth with logical structure and get the start position
    let {startRow, startCol} = initializeLabyrinth();
  
    // Adjust player's position based on the starting cell
    player = new Player(startCol * cellSize + cellSize / 2, -20, startRow * cellSize + cellSize / 2);
  

  for (let i = 0; i < 200; i++) {
    tunnels.push(new Tunnel(Math.random() * 1000 * i, 100, 100)); // Offset each tunnel in space
  }

}

function draw() {
  background(0);

  // Update and display player
  player.update();
  player.display();

  for (let tunnel of tunnels) {
    tunnel.display();
  }

  if (frameCount % framesPerDrone === 2) {
    playRandomSound(droneAudioFiles);
  }

  if (frameCount % framesPerFx === 0) {
    playRandomSound(fxAudioFiles);
  }

  if (frameCount % framesPerPiano === 0) {
    playRandomSound(pianoAudioFiles);
  }

  if (frameCount % framesPerPiano2 === 0) {
    playRandomSound(piano2AudioFiles);
  }

  if (frameCount % framesPerSpeaker === 0) {
    playRandomSound(speakerAudioFiles);
  }

  if (frameCount % framesPerVocal === 0) {
    playRandomSound(speakerAudioFiles);
  }
}

function playRandomSound(audioArray){
  const rates = [0.25, 0.5, 1, 2];
  const index = floor(random(audioArray.length));
  const audioFile = audioArray[index];
  audioFile.setVolume(Math.random());
  audioFile.pan(Math.random()*2-1);
  // audioFile.rate(rates[Math.floor(Math.random()*rates.length)]);
  audioFile.rate(Math.random()*1.75+0.25);
  audioFile.play();
}


class Player {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.angle = 0;
      this.speed = 20;
      this.targetX = x; // Target X position
      this.targetZ = z; // Target Z position
    }
  
    update() {
      // Calculate direction towards the target
      let dx = this.targetX - this.x;
      let dz = this.targetZ - this.z;
      let distance = sqrt(dx * dx + dz * dz);
  
      // Move towards the target if it's not close enough
      if (distance > this.speed) {
        dx /= distance; // Normalize
        dz /= distance; // Normalize
  
        // Check collision for the next step before moving
        let nextX = this.x + dx * this.speed;
        let nextZ = this.z + dz * this.speed;
  
        if (!this.collidesWithBlock(nextX, this.z)) {
          this.x = nextX;
        }
        if (!this.collidesWithBlock(this.x, nextZ)) {
          this.z = nextZ;
        }
      }
    }
    
    // Modified collision detection to handle one direction at a time
    collidesWithBlock(newX, newZ) {
      let buffer = 5; // Small buffer to prevent getting too close to the block edges
      let gridX = Math.floor((newX + buffer) / cellSize);
      let gridZ = Math.floor((newZ + buffer) / cellSize);
      let gridXNeg = Math.floor((newX - buffer) / cellSize);
      let gridZNeg = Math.floor((newZ - buffer) / cellSize);
    
      // Check the player's surrounding area, considering the buffer
      if (this.checkBlock(gridX, gridZ) || this.checkBlock(gridXNeg, gridZ) || this.checkBlock(gridX, gridZNeg) || this.checkBlock(gridXNeg, gridZNeg)) {
        return true;
      }
      return false;
    }
    
    // Helper method to simplify checking if a cell contains a block
    checkBlock(x, z) {
      if (x < 0 || x >= cols || z < 0 || z >= rows) {
        return true; // Out-of-bounds treated as collision
      }
      return labyrinth[z][x] === 1;
    }
    
    adjustAngle(deltaAngle) {
      this.angle += deltaAngle;
    }
  

    display() {
      // Set the camera to follow the player
      let camX = this.x - (100 * sin(this.angle));
      let camY = this.y; // Camera slightly above the player's head
      let camZ = this.z - (100 * cos(this.angle));
      camera(camX, camY, camZ, this.x + sin(this.angle), this.y, this.z + cos(this.angle), 0, 1, 0);
    
      // Draw the white floor
      push();
      translate(0, cellSize / 2, 0); // Position it at the player's feet level
      rotateX(HALF_PI); // Rotate to make it horizontal
      fill(255); // Set the fill color to white
      noStroke(); // No border
      texture(boxTexture2);
      plane(cols * cellSize, rows * cellSize); // The floor size should cover the entire labyrinth
      pop();
    
      // Draw the labyrinth
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (labyrinth[i][j] == 1) {
            push();
            translate(j * cellSize - width / 2, 0, i * cellSize - height / 2);
            noStroke();
            texture(boxTexture2); // Apply the image as a texture
            box(cellSize, cellSize, cellSize); // Draw larger boxes
            pop();
          }
        }
      }
    }
    
}
class Tunnel {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = Math.random()*1200;
    this.height = Math.random()*1200;
  }
  
  display() {
    // Apply the image as a texture
    texture(boxTexture2);
  
    // Position the tunnel
    push();
    translate(this.x, this.y, this.z);
    noStroke();
    // Rotate the tunnel for a bit of variation
    rotateX(frameCount * 0.001 + this.x);
    rotateY(frameCount * 0.001 + this.y);

    // Create a cylinder (the tunnel shape)
    torus(this.width, this.height);
    pop();
  }
}
function initializeLabyrinth() {
  // Initialize all cells as walls
  for (let i = 0; i < rows; i++) {
    labyrinth[i] = [];
    for (let j = 0; j < cols; j++) {
      labyrinth[i][j] = 1; // 1 represents a wall
    }
  }

  // Choose an initial cell and mark it as part of the maze
  let startRow = 2; // Use 2 to ensure it's not on the edge (for simplicity)
  let startCol = 2; // Same reasoning as above
  labyrinth[startRow][startCol] = 0; // 0 represents a passage

  // Initialize the frontier with the neighbors of the starting cell
  let frontier = [];
  addAdjacentToFrontier(startRow, startCol, frontier);

  while (frontier.length > 0) {
    let frontierIndex = Math.floor(Math.random() * frontier.length);
    let cell = frontier.splice(frontierIndex, 1)[0];

    // Connect the cell to the maze by finding an adjacent maze cell
    let mazeNeighbors = findMazeNeighbors(cell[0], cell[1]);

    if (mazeNeighbors.length > 0) {
      let neighborIndex = Math.floor(Math.random() * mazeNeighbors.length);
      let neighbor = mazeNeighbors[neighborIndex];

      // Mark the wall between the maze cell and the chosen frontier cell as a passage
      labyrinth[(cell[0] + neighbor[0]) / 2][(cell[1] + neighbor[1]) / 2] = 0;

      // Mark the chosen frontier cell as part of the maze
      labyrinth[cell[0]][cell[1]] = 0;

      // Add the new cell's neighbors to the frontier
      addAdjacentToFrontier(cell[0], cell[1], frontier);
    }
  }

  return {startRow, startCol};
}

function addAdjacentToFrontier(row, col, frontier) {
  let directions = [[2, 0], [-2, 0], [0, 2], [0, -2]];
  directions.forEach(direction => {
    let newRow = row + direction[0];
    let newCol = col + direction[1];
    if (newRow > 0 && newRow < rows && newCol > 0 && newCol < cols && labyrinth[newRow][newCol] === 1) {
      frontier.push([newRow, newCol]);
    }
  });
}

function findMazeNeighbors(row, col) {
  let neighbors = [];
  let directions = [[2, 0], [-2, 0], [0, 2], [0, -2]];
  directions.forEach(direction => {
    let newRow = row + direction[0];
    let newCol = col + direction[1];
    if (newRow > 0 && newRow < rows && newCol > 0 && newCol < cols && labyrinth[newRow][newCol] === 0) {
      neighbors.push([newRow, newCol]);
    }
  });
  return neighbors;
}

function mousePressed() {
  // Calculate the target position in the labyrinth coordinates
  let targetX = player.x + (mouseX - width / 4);
  let targetZ = player.z + (mouseY - height / 4);

  // Update player's target position
  player.targetX = targetX;
  player.targetZ = targetZ;
}

function mouseDragged() {
  // Calculate the change in mouse position
  let dx = mouseX - pmouseX;
  
  // Sensitivity factor for the angle change - adjust as needed
  let sensitivity = 0.005;

  // Adjust the player's angle based on the mouse movement
  player.adjustAngle(dx * sensitivity);
}
