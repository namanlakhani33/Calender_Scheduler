import React, { Component } from "react";
import BigCalendar from "react-big-calendar";
import moment from "moment";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import TimePicker from "material-ui/TimePicker";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Navbar.css";

BigCalendar.momentLocalizer(moment);

class Calendar extends Component {
  constructor() {
    super();
    this.state = {
      events: [],
      title: "",
      start: "",
      end: "",
      desc: "",
      command: "",
      openSlot: false,
      openEvent: false,
      clickedEvent: {},
      videoData: [],
    };
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.fetchEvents();
    } 
    else {
      // Optionally handle the case where the user is not authenticated
      console.log("Not authenticated: Access denied.");
    }

   
  }

  fetchEvents() {
    console.log("Fetching events...");
    fetch("http://localhost:5000/api/events", {
      credentials: 'include'  // Important for sessions
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      this.setState({ events: data });
      console.log("Events fetched successfully:", data);
    })
    .catch(error => {
      console.error("Error fetching events:", error);
    });
  }

  handleCommandSubmit(command) {
    fetch("http://localhost:5000/api/process_command", {
      
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        this.updateCalendarWithData(data);
        this.fetchEvents(); // Fetch updated events after processing the command
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  updateCalendarWithData(data) {
    const { title, start, end, desc } = data;
    const newAppointment = { title, start, end, desc };

    fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAppointment),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        this.fetchEvents(); // Fetch updated events after adding a new one
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleClose() {
    this.setState({ openEvent: false, openSlot: false });
  }

  handleSlotSelected(slotInfo) {
    this.setState({
      title: "",
      desc: "",
      start: slotInfo.start,
      end: slotInfo.end,
      openSlot: true,
    });
  }

  handleEventSelected(event) {
    this.setState({
      openEvent: true,
      clickedEvent: event,
      start: event.start,
      end: event.end,
      title: event.title,
      desc: event.desc,
    });
  }

  setTitle(e) {
    this.setState({ title: e });
  }

  setDescription(e) {
    this.setState({ desc: e });
  }

  handleStartTime = (event, date) => {
    this.setState({ start: date });
  };

  handleEndTime = (event, date) => {
    this.setState({ end: date });
  };

  setNewAppointment() {
    const { start, end, title, desc } = this.state;
    const newAppointment = { title, start, end, desc };

    fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAppointment),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        this.fetchEvents(); // Fetch updated events after adding a new one
        this.handleClose(); // Close the dialog
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Clear form after submission
    this.setState({ title: "", start: "", end: "", desc: "", openSlot: false });
  }

  updateEvent() {
    const { title, desc, start, end, events, clickedEvent } = this.state;
    const index = events.findIndex((event) => event === clickedEvent);
    const updatedEvent = events.slice();
    updatedEvent[index].title = title;
    updatedEvent[index].desc = desc;
    updatedEvent[index].start = start;
    updatedEvent[index].end = end;

    fetch(`http://localhost:5000/api/events/${clickedEvent.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        desc,
        start,
        end,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        this.fetchEvents(); // Fetch updated events after editing
        this.handleClose(); // Close the dialog
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    this.handleClose();
  }

  deleteEvent() {
    const { clickedEvent } = this.state;
    fetch(`http://localhost:5000/api/events/${clickedEvent.id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        this.fetchEvents(); // Fetch updated events after deletion
        this.handleClose(); // Close the dialog
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  
    this.handleClose();
  }

  render() {
    console.log("render()");
    
    const eventActions = [
      <FlatButton
        label="Cancel"
        primary={false}
        keyboardFocused={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Delete"
        secondary={true}
        keyboardFocused={true}
        onClick={() => {
          this.deleteEvent(), 
          this.handleClose();
        }}
      />,
      <FlatButton
        label="Confirm Edit"
        primary={true}
        keyboardFocused={true}
        onClick={() => {
          this.updateEvent(), this.handleClose();
        }}
      />,
    ];
    const appointmentActions = [
      <FlatButton label="Cancel" secondary={true} onClick={this.handleClose} />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={() => {
          this.setNewAppointment(), this.handleClose();
        }}
      />,
    ];
    if (!this.props.isAuthenticated) {
      return <div>Please log in to access the calendar.</div>;
    }
      
    
    return (
      <div id="Calendar">

      <nav className="nav-bar">
        <a href="http://localhost:8501/"   className="nav-button" style={{ marginRight: "15px" }}>Coursera Recommendation</a>
        <a href="http://localhost:3005/"   className="nav-button">YouTube Recommendation</a>
      </nav>


      <div className="command-section">
          <TextField
            floatingLabelText="Enter Command"
            onChange={(e) => {
              this.setState({ command: e.target.value });
            }}
            multiLine={true}
            rows={2}
            className="command-input"
          />
          <FlatButton
            label="Submit Command"
            primary={true}
            keyboardFocused={true}
            onClick={() => {
              this.handleCommandSubmit(this.state.command);
            }}
            className="command-button"
          />
          
        </div>

        <BigCalendar
          events={this.state.events}
          views={["month", "week", "day", "agenda"]}
          timeslots={2}
          defaultView="month"
          defaultDate={new Date()}
          selectable={true}
          onSelectEvent={(event) => this.handleEventSelected(event)}
          onSelectSlot={(slotInfo) => this.handleSlotSelected(slotInfo)}
        />
        <iframe 
          src="http://localhost:8501/"
          title="Coursera Recommendation"
          style={{ width: '100%', height: '700px', border: 'none' }}
        />

        <iframe 
          src="http://localhost:3005/"
          title="YouTube Recommendation"
          style={{ width: '100%', height: '1000px', border: 'none' }}
        />

        <Dialog
          title={`Book an appointment on ${moment(this.state.start).format(
            "MMMM Do YYYY"
          )}`}
          actions={appointmentActions}
          modal={false}
          open={this.state.openSlot}
          onRequestClose={this.handleClose}
        >
          <TextField
            floatingLabelText="Title"
            onChange={(e) => {
              this.setTitle(e.target.value);
            }}
          />
          <br />
          <TextField
            floatingLabelText="Description"
            onChange={(e) => {
              this.setDescription(e.target.value);
            }}
          />
          <TimePicker
            format="ampm"
            floatingLabelText="Start Time"
            minutesStep={5}
            value={this.state.start}
            onChange={this.handleStartTime}
          />
          <TimePicker
            format="ampm"
            floatingLabelText="End Time"
            minutesStep={5}
            value={this.state.end}
            onChange={this.handleEndTime}
          />
        </Dialog>

        <Dialog
          title={`View/Edit Appointment of ${moment(this.state.start).format(
            "MMMM Do YYYY"
          )}`}
          actions={eventActions}
          modal={false}
          open={this.state.openEvent}
          onRequestClose={this.handleClose}
        >
          <TextField
            defaultValue={this.state.title}
            floatingLabelText="Title"
            onChange={(e) => {
              this.setTitle(e.target.value);
            }}
          />
          <br />
          <TextField
            floatingLabelText="Description"
            multiLine={true}
            defaultValue={this.state.desc}
            onChange={(e) => {
              this.setDescription(e.target.value);
            }}
          />
          <TimePicker
            format="ampm"
            floatingLabelText="Start Time"
            minutesStep={5}
            value={this.state.start}
            onChange={this.handleStartTime}
          />
          <TimePicker
            format="ampm"
            floatingLabelText="End Time"
            minutesStep={5}
            value={this.state.end}
            onChange={this.handleEndTime}
          />
        </Dialog>
      </div>
    );
  }
}



export default Calendar;
