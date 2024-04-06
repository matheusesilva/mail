document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  document.querySelector('#compose-view h3').innerHTML = 'New Email';

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  const to = document.querySelector('#compose-recipients');
  const title = document.querySelector('#compose-subject');
  to.value = "";
  title.value = "";
  to.disabled = false;
  title.disabled = false;
  document.querySelector('#compose-body').value = '';

  // Add event listner to the compose-form submit button
  document.querySelector('#compose-form').onsubmit = function() {

    // Get the input data
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    console.log(recipients,subject,body);

    // Send through th api
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  
    load_mailbox('inbox');

    return false;
  };
}

function load_email(email_id) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Clean email view
  document.querySelector('#email-view').innerHTML = ''

  // Get the email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Show the email
      let container = document.querySelector('#email-view');
      const sender = document.createElement('div');
      const recipients = document.createElement('div');
      const subject = document.createElement('div');
      const timestamp = document.createElement('div');
      const body = document.createElement('div');
      const reply = document.createElement('button');
      sender.innerHTML = `From: <span>${email['sender']}</span>`;
      recipients.innerHTML = `To: ${email['recipients']}`;
      subject.innerHTML = `Subject: ${email['subject']}`;
      timestamp.innerHTML = email['timestamp'];
      let formatedBody = email['body'].replaceAll('wrote:', 'wrote: <br/>');
      formatedBody = formatedBody.replaceAll('___', '<br/>___<br/>');

      

      body.innerHTML = formatedBody;
      reply.innerHTML = 'Reply';
      reply.classList.add('btn', 'btn-sm', 'btn-outline-primary');
      reply.addEventListener('click', () => reply_email(email_id));
      container.append(sender, recipients, subject, timestamp, reply, body);
  });

  // Set email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails to the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  // Print emails
    console.log(emails);

    emails.forEach(email => {

      // For each email is created a container
      let container = document.createElement('div');
      container.classList.add('email-container', `read-${email['read']}`);
      const to = document.createElement('div');
      const title = document.createElement('div');
      const time = document.createElement('div');
      to.innerHTML = email['sender'];
      title.innerHTML = email['subject'];
      time.innerHTML = email['timestamp'];
      container.append(to, title, time);
      
      // Add button Archive/Unarchive
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-sm', 'btn-outline-primary')
      if (mailbox == 'inbox') {
        button.innerHTML = 'Archive';
        button.addEventListener('click', function(event) {
          event.stopPropagation();
          fetch(`/emails/${email['id']}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          load_mailbox(mailbox);
        })
        container.appendChild(button);
      } else if (mailbox == 'archive'){
        button.innerHTML = 'Unarchive';
        button.addEventListener('click', function(event) {
          event.stopPropagation();
          fetch(`/emails/${email['id']}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          load_mailbox('inbox');
        })
        container.appendChild(button);
      }

      
      // Each container has a click event that shows the email content
      container.addEventListener('click', () => load_email(parseInt(email['id'])));

      // The container is added to the emails-view
      document.querySelector('#emails-view').appendChild(container);
    });

  });
}

function reply_email (email_id) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  document.querySelector('#compose-view h3').innerHTML = 'Reply Email';

  const to = document.querySelector('#compose-recipients');
  const title = document.querySelector('#compose-subject');
  const content = document.querySelector('#compose-body');

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      
    to.value = email['recipients'];
    if (email['subject'].match(/Re:/i)) {
      title.value = email['subject'];
      
      const index = email['body'].lastIndexOf('___');
      const pastMessages = email['body'].slice(0,index);
      const currentlyMessage = email['body'].slice(index+4);
      content.innerHTML = `${pastMessages}___&#13;&#10;On ${email['timestamp']} ${email['sender']} wrote: ${currentlyMessage}&#13;&#10;___&#13;&#10;`;
      
    } else {
      title.value = `Re: ${email['subject']}`;
      content.innerHTML = `On ${email['timestamp']} ${email['sender']} wrote: &#13;&#10;${email['body']}&#13;&#10;___&#13;&#10;`;
    }
    to.disabled = true;
    title.disabled = true;

    document.querySelector('#compose-form').onsubmit = function() {
      
      // Send through th api
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: to.value,
            subject: title.value,
            body: content.value
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
    
      load_mailbox('inbox');
  
      return false;
    };
  });



}
