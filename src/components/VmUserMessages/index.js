import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Notification, NotificationDrawer, MenuItem, Icon, Button } from 'patternfly-react'
import OverlayTooltip from '../OverlayTooltip'

import style from './style.css'

import { clearUserMessages, dismissEvent } from '_/actions'
import { hrefWithoutHistory, getFormatedDateTime } from '_/helpers'
import { msg } from '_/intl'

const UserMessage = ({ record, id, onDismissMessage }) => {
  const time = getFormatedDateTime(record.get('time'))
  return (<Notification seen>
    <NotificationDrawer.Dropdown id={id}>
      <MenuItem onClick={onDismissMessage}>
        { msg.clear() }
      </MenuItem>
    </NotificationDrawer.Dropdown>
    <Icon className='pull-left' type='pf' name='warning-triangle-o' />
    <Notification.Content>
      <Notification.Message>
        {record.get('message')}
      </Notification.Message>
      <Notification.Info leftText={time.date} rightText={time.time} />
    </Notification.Content>
  </Notification>)
}
UserMessage.propTypes = {
  record: PropTypes.object.isRequired,
  id: PropTypes.string,
  onDismissMessage: PropTypes.func.isRequired,
}

class VmUserMessages extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      expand: false,
    }
    this.handleToggle = this.handleToggle.bind(this)
    this.handleExpand = this.handleExpand.bind(this)
  }

  handleToggle () {
    this.setState((prevState) => ({ show: !prevState.show }))
  }

  handleExpand () {
    this.setState((prevState) => ({ expanded: !prevState.expanded }))
  }

  render () {
    const { userMessages, onClearMessages, onDismissMessage } = this.props

    const idPrefix = `usermsgs`

    const messagesCount = userMessages.get('records').size
    const messagesList = messagesCount
      ? userMessages.get('records').map(r => (
        <UserMessage
          key={`msg-${r.get('time')}`}
          record={r}
          id={`${idPrefix}-msg-${r.get('time')}-dropdown`}
          onDismissMessage={() => onDismissMessage(r.toJS())}
        />
      ))
      : <NotificationDrawer.EmptyState title={msg.noMessages()} />

    const badgeElement = messagesCount === 0
      ? null
      : <span className='badge' id={`${idPrefix}-size`}>{messagesCount}</span>
    return (
      <li className='dropdown'>
        <OverlayTooltip id={`${idPrefix}-tooltip`} tooltip={msg.notifications()} placement='bottom'>
          <a className='dropdown-toggle nav-item-iconic' href='#' onClick={hrefWithoutHistory(this.handleToggle)} id={`${idPrefix}-toggle`}>
            <i className={`fa fa-bell ${style['usermessages-icon']}`} />
            {badgeElement}
            <span className='caret' id={`${idPrefix}-caret`} />
          </a>
        </OverlayTooltip>
        <NotificationDrawer hide={!this.state.show} expanded={this.state.expanded}>
          <NotificationDrawer.Title onCloseClick={this.handleToggle} onExpandClick={this.handleExpand} />
          <NotificationDrawer.PanelBody className={style['panel-body']}>
            <div className={style['notifications-list']}>
              {messagesList}
            </div>
            { messagesCount > 0 &&
              <NotificationDrawer.PanelAction className={style['action-panel']}>
                <NotificationDrawer.PanelActionLink data-toggle='clear-all'>
                  <Button bsStyle='link' onClick={onClearMessages}>
                    <Icon type='pf' name='close' />
                    { msg.clearAll() }
                  </Button>
                </NotificationDrawer.PanelActionLink>
              </NotificationDrawer.PanelAction>
            }
          </NotificationDrawer.PanelBody>
        </NotificationDrawer>
      </li>

    )
  }
}
VmUserMessages.propTypes = {
  userMessages: PropTypes.object.isRequired,
  onClearMessages: PropTypes.func.isRequired,
  onDismissMessage: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    config: state.config,
    userMessages: state.userMessages,
  }),
  (dispatch) => ({
    onClearMessages: () => dispatch(clearUserMessages()),
    onDismissMessage: (event) => dispatch(dismissEvent({ event })),
  })
)(VmUserMessages)
