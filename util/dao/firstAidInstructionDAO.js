let dbUtil = require('../dbUtil');
let FirstAid = dbUtil.getModel('FirstAidInstruction');


let instructions = [
  {
    "category": "Heart Attack",
    "content": "<ol> <li><p><strong>Make the casualty as comfortable as possible</strong> to ease the strain on his heart. A half sitting position, with his head and shoulders supported and his knees bent, is often best. Place cushions behind him and under his knees.</p></li> <li><p><strong>Assist the casualty</strong> to take up to one full-dose adult aspirin tablet (325 mg) or four baby aspirin (81 mg each). Advise him to chew it slowly.</p></li> <li><p><strong>If the casualty has angina medication</strong>, such as tablets or a pump-action or aerosol spray, let him administer it; help him if necessary. Encourage him to rest.</p></li> <li><p><strong>Monitor and record vital signs</strong> — level of response, breathing, and pulse (pp.52–53) —while waiting for help. Stay calm to avoid undue stress.</p></li> </ol>"
  },
  {
    "category": "Finger Wound",
    "content": "<ol> <li><p>If the wound to the finger breaks the skin, it should be cleaned with soap and water like any other abrasion.</p></li> <li><p>Press a sterile dressing or clean gauze pad on the wound and apply direct pressure to control bleeding.</p></li> <li><p>Raise and support the injured hand and maintain pressure on the wound until the bleeding stops.</p></li> <li><p>When the bleeding has stopped, cover the wound to protect it. Use an adhesive dressing or for a larger wound apply a dressing pad, secured with a tubular gauze bandage. If there is a fracture or dislocation, the finger should be splinted.</p></li> <li><p>If you need to take the casualty to the hospital, support the injured arm in an elevation sling (p.252).</p></li> </ol>"
  },
  {
    "category": "Choking",
    "content": "<ol> <li><p>If the casualty is breathing, encourage her to continue coughing. If she is not coughing and not able to breathe, she is choking. Go to step 2.</p></li> <li><p>Stand behind the casualty with one leg back and the other between the casualty’s legs, and put both arms around the upper part of her abdomen. Clench your fist with your thumb on top of your index finger and place it between the navel and the bottom of her breastbone. Grasp your fist firmly with your other hand. Thrust sharply inward and upward until the object is dislodged or the casualty becomes unconscious.</p></li> <li><p>If the casualty loses consciousness, carefully support her to the floor, immediately begin CPR with chest compressions (pp.66–67). Each time the airway is opened during CPR, look for an object in the casualty&rsquo;s mouth and, if seen, remove it.</p></li> <li><p>If the obstruction still has not cleared, continue CPR until help arrives.</p></li> </ol>"
  },
  {
    "category": "Faint",
    "content": "<ol> <li><p><strong>When a casualty feels faint</strong>, advise him to lie down. Kneel down, raise his legs, supporting his ankles on your shoulders to improve blood flow to the brain. Watch his face for signs of recovery.</p></li> <li><p><strong>Make sure that the casualty</strong> has plenty of fresh air; ask someone to open a window if you are indoors. In addition, ask any bystanders to stand clear. He may be more comfortable if his knees are bent.</p></li> <li><p><strong>As the casualty recovers</strong>, reassure him and help him sit up gradually. If he starts to feel faint again, advise him to lie down once again, and raise and support his legs until he recovers fully.</p></li> </ol>"
  }
];

class firstAidInstructionDAO{
  static getAllInstructions(){
    return new Promise(function (resovle,reject) {
      FirstAid.find()
        .then(function (data) {
          resovle(data);
        })
        .catch(function (err) {
          reject(err);
        })
    });
  }
  static getInstructionByName(category){
    return new Promise(function (resovle,reject) {
      FirstAid.findOne({category:category})
        .then(function (data) {
          resovle(data);
        })
        .catch(function (err) {
          reject(err);
        })
    });
  }
  static createNewInstruction(category,content) {
    return new FirstAid({
      category:category,
      content:content
    });
  }

  static insertNewInstruction(category,content) {
    return new Promise(function (resolve,reject) {
      firstAidInstructionDAO.createNewInstruction(category,content)
        .save()
        .then(function (data) {
          resolve(data);
        })
        .catch(function (err) {
          reject(err);
        })
    })
  }

  static getInstructionById(id_){
    return new Promise(function(resolve, reject){
      FirstAid.findOne({_id: id_})
        .then(function(data){
          resolve(data);
        })
        .catch(function(err){
          reject(err);
        })
    })
  }

  static clear(){
    return new Promise(function(resolve, reject){
      FirstAid.remove({})
        .then(function(data){
          resolve(data);
        })
        .catch(function(err){
          reject(err);
        })
    })
  }
}

module.exports = firstAidInstructionDAO;