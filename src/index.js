export class ParseLQ {
  options = {
    applicationId: "",
    javascriptKey: "",
    serverURL: "",
    masterKey: "",
    restAPIKey: "",
    clientKey: "",
    className: "",
    requestId: ""
  };

  client = null;

  connected = false;

  subscribed = false;

  nestedEvent = {
    on: async cb => {
      await this.subscribedChecking();
      this.client.onmessage = res => {
        const data = JSON.parse(res.data);
        switch (data.op) {
          case "update":
            cb({
              on: "update",
              object: data.object
            });
            break;
          case "create":
            cb({
              on: "create",
              object: data.object
            });
            break;
          case "delete":
            cb({
              on: "delete",
              object: data.object
            });
            break;
          case "enter":
            cb({
              on: "enter",
              object: data.object
            });
            break;
          case "leave":
            cb({
              on: "leave",
              object: data.object
            });
            break;
          // no default
        }
      };
    }
  };

  subscribedChecking = () => {
    return new Promise(resolve => {
      let interver = null;
      interver = setInterval(() => {
        if (this.subscribed) {
          clearInterval(interver);
          resolve(true);
        }
      });
    });
  };

  constructor(
    options = {
      applicationId: "",
      serverURL: "",
      javascriptKey: "",
      masterKey: "",
      restAPIKey: "",
      clientKey: ""
    }
  ) {
    this.options = {
      applicationId: options.applicationId,
      serverURL: options.serverURL,
      javascriptKey: options.javascriptKey,
      masterKey: options.masterKey,
      restAPIKey: options.restAPIKey,
      clientKey: options.clientKey,
      className: "",
      requestId: ""
    };

    this.client = new WebSocket(this.options.serverURL, ["protocolOne"]);
  }

  open() {
    let protocol = {
      op: "connect",
      applicationId: this.options.applicationId,
      restAPIKey: this.options.restAPIKey, // Optional
      javascriptKey: this.options.javascriptKey, // Optional
      clientKey: this.options.clientKey
    };
    protocol = JSON.stringify(protocol);
    this.client.onopen = () => {
      this.client.send(protocol);
    };

    this.client.onmessage = e => {
      const res = JSON.parse(e.data);
      if (res.op === "connected") {
        console.log("connected");
        this.connected = true;
      }
    };
  }

  randomInteger = pow => {
    return Math.floor(Math.random() * pow);
  };

  subscribe(className = "") {
    this.options.className = className;
    let interver = null;
    interver = setInterval(() => {
      if (this.connected) {
        clearInterval(interver);
        const requestId = this.randomInteger(10000);
        this.options.requestId = requestId;
        const subscribe = JSON.stringify({
          op: "subscribe",
          requestId,
          query: {
            className,
            where: { objectId: { $ne: "" } }
          }
        });

        this.client.send(subscribe);

        this.client.onmessage = e => {
          const res = JSON.parse(e.data);
          if (res.op === "subscribed") {
            console.log("subscribed");
            this.subscribed = true;
          }
        };
      }
    }, 500);
    return this.nestedEvent;
  }

  unsubscribe() {
    this.client.send(
      JSON.stringify({
        op: "unsubscribe",
        requestId: this.options.requestId
      })
    );

    this.client.onmessage = e => {
      const res = JSON.parse(e.data);
      if (res.op === "unsubscribed") {
        console.log("unsubscribed");
        this.subscribed = false;
      }
    };
  }

  close() {
    this.client.close();
  }
}
