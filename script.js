function openGiftBox() {
  // Animate the lid
  document.querySelector('.lid').classList.add('open');
  // Stop the bounce animation on box
  document.getElementById('gift-box').style.animation = "none";
  // After animation, show the greeting and hide the box
  setTimeout(function() {
    document.getElementById('gift-box-container').style.display = 'none';
    document.getElementById('greeting').style.display = 'flex';
  }, 700); // Match this to the CSS transition duration
}
