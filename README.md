# 🔐 CTF Maze Challenge - Cybersecurity Game

A fun, visually appealing CTF (Capture The Flag) game where players navigate through a procedurally generated maze, answer cybersecurity questions at checkpoints, and capture the flag to win!

## Features

✨ **Interactive Gameplay**
- Navigate through a procedurally generated maze using Arrow Keys or WASD
- Smooth character movement with collision detection
- Real-time score tracking and health system

❓ **Cybersecurity Education**
- 8 challenging cybersecurity questions covering:
  - SQL Injection
  - Phishing attacks
  - XSS (Cross-Site Scripting)
  - Brute Force attacks
  - HTTPS encryption
  - Zero-day vulnerabilities
  - Two-Factor Authentication
  - Ransomware

🎯 **Dynamic Checkpoints**
- Random question checkpoints throughout the maze
- Answer correctly to progress (gain points)
- Answer incorrectly to lose health
- Completed checkpoints are marked with checkmarks

🏆 **Flag System**
- Reach the exit to reveal the generated flag
- Submit the flag to win the game
- Score tracking and statistics

🎨 **Cyberpunk Aesthetics**
- Neon green and magenta color scheme
- Glowing effects and smooth animations
- Terminal-style UI with monospace fonts
- Dark background with gradient effects

## How to Play

1. **Start the Game**
   - Open `index.html` in a web browser
   - Click "Start Game" to begin

2. **Navigate the Maze**
   - Use **Arrow Keys** or **WASD** to move your character
   - Avoid running into walls (pink/magenta colored areas)
   - Move in any direction to explore

3. **Answer Questions**
   - When you reach a blue question checkpoint (?), a question will appear
   - Select your answer from the options
   - Click "Submit Answer" to check your answer
   - ✓ Correct answers: +10 points, progression unlocked
   - ✗ Incorrect answers: -10 health

4. **Reach the Exit**
   - Navigate to the green EXIT square in the bottom-right corner
   - Once you reach it, your flag will be displayed

5. **Submit the Flag**
   - Copy the displayed flag
   - Enter it in the flag submission field
   - Click "Submit Flag" to win!

## Game Elements

| Element | Description |
|---------|-------------|
| 🟢 Green Box (Player) | You - your position in the maze |
| 🟣 Pink/Magenta Walls | Walls - cannot pass through |
| 🔵 Blue Circle (?) | Question Checkpoint - answer to progress |
| 🔵 Blue Circle (✓) | Completed Checkpoint |
| 🟢 Green Box (Bottom-Right) | EXIT - reach here to get flag |

## File Structure

```
ctf/
├── index.html          # Main HTML file
├── styles.css          # Styling with cyberpunk theme
├── game.js            # Game logic and mechanics
└── README.md          # This file
```

## Installation

1. Clone or download the files to a folder
2. Open `index.html` in any modern web browser
3. No server or dependencies required - runs entirely client-side!

## Browser Compatibility

- Chrome/Chromium ✓
- Firefox ✓
- Safari ✓
- Edge ✓
- Modern browsers with HTML5 Canvas support

## Scoring System

- Starting Score: 0
- Points per correct answer: +10
- Penalties for incorrect answers: -10 health
- Health starts at 100
- Game Over if health reaches 0

## Customization

### Add More Questions

Edit `questionsDatabase` in `game.js`:

```javascript
{
    question: "Your question here?",
    options: [
        "Correct answer",
        "Wrong answer 1",
        "Wrong answer 2",
        "Wrong answer 3"
    ],
    correct: 0,  // Index of correct answer
    points: 10
}
```

### Change Maze Difficulty

Modify `CELL_SIZE` in `game.js`:
- Larger value = simpler maze
- Smaller value = more complex maze

### Customize Colors

Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #00ff88;        /* Main green */
    --secondary: #ff006e;      /* Pink/magenta */
    --bg: #0a0e27;            /* Dark background */
    --accent: #00d4ff;        /* Cyan accent */
}
```

## Tips & Tricks

1. **Maze Navigation**: Use WASD for faster diagonal movement
2. **Question Strategy**: Read all options carefully before selecting
3. **Time Management**: There's no time limit, take your time!
4. **Exploration**: Try to find all checkpoints for maximum points

## Game Mechanics

- **Procedural Maze Generation**: Each game generates a unique maze using recursive backtracking
- **Collision Detection**: Realistic wall collisions prevent moving through walls
- **Health System**: Tracks player performance through questions
- **Dynamic Checkpoints**: Questions appear at specific coordinates
- **Canvas Rendering**: Smooth 60fps gameplay

## Accessibility

- Keyboard controls only (Arrow Keys or WASD)
- Clear, readable fonts
- High contrast colors for visibility
- Simple UI navigation

## Future Enhancements

- [ ] Multiplayer modes
- [ ] Leaderboard system
- [ ] Different difficulty levels
- [ ] More cybersecurity topics
- [ ] Power-ups and special items
- [ ] Boss challenges
- [ ] Sound effects and music
- [ ] Save/Load game state

## License

Free to use and modify for educational purposes.

## Support

If you encounter any issues:
1. Check that `index.html`, `styles.css`, and `game.js` are in the same folder
2. Ensure JavaScript is enabled in your browser
3. Try a different browser
4. Clear browser cache and reload

---

**Happy Gaming! 🎮 Good luck capturing the flag! 🏆**
