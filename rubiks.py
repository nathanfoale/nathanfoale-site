from vpython import box, vector, color, scene

# Set up scene
scene.background = color.white
scene.title = "Rubik's Cube Simulator"

# Colors for the cube faces
colors = {
    'U': color.white,
    'D': color.yellow,
    'L': color.blue,
    'R': color.green,
    'F': color.red,
    'B': color.orange
}

# Create the 3x3x3 cube
cubelets = []
offset = 1.05  # Space between cubelets for visual clarity

for x in [-1, 0, 1]:
    for y in [-1, 0, 1]:
        for z in [-1, 0, 1]:
            cubelet = box(pos=vector(x * offset, y * offset, z * offset),
                          size=vector(0.95, 0.95, 0.95),
                          color=color.gray(0.3))  # Default to dark gray
            cubelets.append(cubelet)


