require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser") 

const {Suprsend} = require("@suprsend/node-sdk");
const { Workflow } = require("@suprsend/node-sdk")

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static("public"));


const workspace_key = process.env.WORKSPACE_KEY;
const workspace_secret = process.env.WORKSPACE_SECRET;
const supr_client = new Suprsend(workspace_key, workspace_secret);


app.get("/",function(req, res){
    res.send("Suprsend-Api");
}); 

/****************************************** Sending Notifications ***************************************/

app.post("/send-notification", async (req, res) => {
    let { user_id,user_phone,tenant_id } = req.body;
    let check = true;
    if(!tenant_id)tenant_id = "suprsend1"
    try {
      const workflow_body = {
      "name": "Suprsend-NotificationApi",
      "template": "suprsend-api-notification-system",
      "notification_category": "transactional",
      "users": [
        {
          "distinct_id": user_id,
          "$email": [user_id],
          "$sms" : [user_phone],
        }
      ],
  
      "delivery": {
        "success": "seen",
        "mandatory_channels": [] 
      },
  
      "data": {
          "Data":"Suprsend is a platform where you can send notifications"
      }
    }
    const wf = new Workflow(workflow_body,{brand_id : tenant_id });
    const response =  supr_client.trigger_workflow(wf) 
    response.then((res) =>{ 
      console.log("response", res)
      if(res.success===true && res.status_code==202){
        check = true;
      }
      else{
        check = false;
      }
    });  
    if(check){
       res.send("success");
    }
    else {
      res.send("failure");
    }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  /****************************************** Listen event  ***************************************/
  
  app.listen(3000,function(){
      console.log("server started on port 3000");
  })
  