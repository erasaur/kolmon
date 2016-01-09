var constants = KOL.constants;

Template.bag.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT
});

Template.bag.onRendered(function () {
  var bgCanvas = document.getElementById("canvas-background");
  var textCanvas = document.getElementById("canvas-text");
  var fgCanvas = document.getElementById("canvas-foreground");
  var fgContext = fgCanvas.getContext("2d");
  var textContext = textCanvas.getContext("2d");
  var bgContext = bgCanvas.getContext("2d");

  var bgImage = new Image();
  bgImage.src = "http://www.tandemdiabetes.com/uploadedImages/Content/_Configuration/Backgrounds/background_gradient_blue.jpg";

  // general itemes
  var tab_items = new Image();
  tab_items.src = "http://cdn.bulbagarden.net/upload/7/78/Bag_Items_ORAS_pocket_icon.png";

  var tab_medicine = new Image();
  tab_medicine.src = "http://cdn.bulbagarden.net/upload/9/9c/Bag_Medicine_ORAS_pocket_icon.png";

  var tab_TM = new Image();
  tab_TM.src = "http://cdn.bulbagarden.net/upload/1/10/Bag_TMs_and_HMs_ORAS_pocket_icon.png";

  var tab_berries = new Image();
  tab_berries.src = "http://cdn.bulbagarden.net/upload/5/56/Bag_Berries_ORAS_pocket_icon.png";

  var tab_keyItems = new Image();
  tab_keyItems.src = "http://cdn.bulbagarden.net/upload/2/28/Bag_Key_items_ORAS_pocket_icon.png";
  

  bgImage.onload = function () {
    var widthScalar = constants.CANVAS_WIDTH / bgImage.width;
    var heightScalar = (constants.CANVAS_HEIGHT) / bgImage.height;

    bgContext.scale(widthScalar, heightScalar);
    bgContext.drawImage(bgImage, 0, 0); 

    fgContext.drawImage(tab_items, 0, 0);
    fgContext.drawImage(tab_medicine, 25, 0);
    fgContext.drawImage(tab_TM, 50, 0);
    fgContext.drawImage(tab_berries, 75, 0);
    fgContext.drawImage(tab_keyItems, 100, 0);
  }


});

function switchToIcon(context, name) {
  // TODO: dim other icons
}