import React, { Component } from 'react';
import styles from './EditorTemplate.scss';
import classNames from 'classnames/bind';
import EditorPane from 'components/editor/EditorPane';
import PreviewPane from 'components/editor/PreviewPane';
import EditorHeader from 'components/editor/EditorHeader';
import Swal from 'sweetalert2';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { SERVER } from 'config/config.json';

const cx = classNames.bind(styles);

class EditorTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      type: 0,
      idx: 0,
      writerName: '',
      writerPicture: '',
      writerUrl: '',
      content: '',
      writeDate: new Date(),
      allowDate: new Date(),
      isLogin: false,
    };
  }
  handleChangeType = type => {
    if (this.state.isLogin === false) {
      Swal.fire({
        type: 'error',
        title: '실명 제보는 로그인 후 가능합니다',
        text: '우측 페이스북 버튼으로 페이스북에 로그인해주세요!',
      });
      return;
    }
    this.setState({
      type: !type,
    });
  };
  handleLogin = response => {
    this.setState({
      writerName: response.name,
      writerPicture: response.picture.data.url,
      writerUrl: response.link,
      isLogin: true,
    });
  };
  handleUpload = img => {
    this.setState({
      ...this.state,
      images: [...this.state.images].concat([img]),
    });
    console.log(this.state.images);
  };
  handleRemove = url => {
    const { images } = this.state;
    this.setState({
      images: images.filter(image => image.url !== url),
    });
  };
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  handleSubmit = async () => {
    if (this.state.content.replace(/^\s+|\s+$/g, '') === '') {
      Swal.fire({
        type: 'error',
        title: '내용을 채워주세요',
      });
      return;
    }
    let data = {};
    if (this.state.type) {
      data = {
        imgs: this.state.images,
        type: this.state.type,
        content: this.state.content,
        writerName: this.state.writerName,
        writerPicture: this.state.writerPicture,
        writerUrl: this.state.writerUrl,
      };
    } else {
      data = {
        imgs: this.state.images,
        type: this.state.type,
        content: this.state.content,
      };
    }
    await axios
      .post(`${SERVER}/user/post`, data)
      .then(async res => {
        await Swal.fire({
          type: 'success',
          title: '제보에 성공했습니다',
          text: '관리자의 승인 후 게시됩니다',
        });
        this.props.history.push('/');
      })
      .catch(e => {
        Swal.fire({
          type: 'error',
          title: '제보 오류',
          text: e.message,
        });
      });
  };
  render() {
    const story = {
      imgs: this.state.images,
      type: this.state.type,
      idx: this.state.idx,
      content: this.state.content,
      writerName: this.state.writerName,
      writerPicture: this.state.writerPicture,
      writerUrl: this.state.writerUrl,
      writeDate: this.state.writeDate,
      allowDate: this.state.allowDate,
    };
    const headerData = {
      type: this.state.type,
      writerName: this.state.writerName,
      writerPicture: this.state.writerPicture,
      writerUrl: this.state.writerUrl,
      isLogin: this.state.isLogin,
    };
    const { content, images } = this.state;
    return (
      <div className={cx('editor-template')}>
        <EditorHeader
          data={headerData}
          onLogin={this.handleLogin}
          onTypeChange={this.handleChangeType}
          onSubmit={this.handleSubmit}
        />
        <div className={cx('panes')}>
          <div className={cx('pane', 'editor')}>
            <EditorPane
              onUpload={this.handleUpload}
              onRemove={this.handleRemove}
              onChange={this.handleChange}
              content={content}
              images={images}
            />
          </div>
          <div className={cx('pane', 'preview')}>
            <PreviewPane story={story} width={'800px'} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(EditorTemplate);