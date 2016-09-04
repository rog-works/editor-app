'use strict';

const FileProvider = require('../helpers/fileprovider');
const Path = require('path');
const Promise = require('promise');

/** XXX root directory */
const ROOT_DIRECTORY = '/opt/app';

class Entry {
	/**
	 * Create instance
	 * @param string realPath real path
	 * @param strring isFile is file type
	 * @param string content content
	 */
	constructor (realPath, isFile, content) {
		const relPath = Entry._toRelativePath(realPath);
		this.path = relPath;
		this.isFile = isFile;
		this.content = content;
	}

	/**
	 * Get keys
	 * @return string[] keys
	 */
	static keys () {
		return ['path', 'isFile', 'content'];
	}

	/**
	 * Get all entries from '/opt/app'
	 * @param string relDirPath Target directory relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static entries (relDirPath = '') {
		const realDirPath = Entry._toRealPath(relDirPath);
		return FileProvider.entries(realDirPath, false)
			.then((entries) => {
				return entries.map((self) => {
					const relPath = Entry._toRelativePath(self);
					const isFile = Entry._isFile(self);
					return new Entry(self, isFile, '');
				});
			});
	}

	/**
	 * Find at entry
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static at (relPath) {
		const realPath = Entry._toRealPath(relPath);
		const isFile = Entry._isFile(realPath);
		if (isFile) {
			return FileProvider.at(realPath)
				.then((content) => {
					return new Entry(realPath, isFile, content);
				});
		} else {
			return new Promise((resolve, reject) => {
				resolve(new Entry(realPath, isFile, ''));
			});
		}
	}

	/**
	 * Create by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static create (relPath) {
		const realPath = Entry._toRealPath(relPath);
		return FileProvider.create(realPath);
	}

	/**
	 * Update by path and content body
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string content Entry content body
	 * @return Promise Return the Promise instance
	 */
	static update (relPath, content) {
		const realPath = Entry._toRealPath(relPath);
		return FileProvider.update(realPath, content);
	}

	/**
	 * Rename by path and to path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @param string relToPath Entry to relative path
	 * @return Promise Return the Promise instance
	 */
	static rename (relPath, relToPath) {
		return FileProvider.rename(Entry._toRealPath(relPath), Entry._toRealPath(relToPath));
	}

	/**
	 * Destroy by path
	 * @param string relPath Entry relative path from '/opt/app'
	 * @return Promise Return the Promise instance
	 */
	static destroy (relPath) {
		return FileProvider.remove(Entry._toRealPath(relPath));
	}

	/**
	 * Check entry is file
	 * @param string realPath Entity real path
	 * @return string entry is file of true
	 */
	static _isFile (realPath) {
		return FileProvider.isFile(realPath);
	}

	/**
	 * Relative path to real path
	 * @param string relPath Entry relative path
	 * @return string Real path
	 */
	static _toRealPath (relPath) {
		return ROOT_DIRECTORY + relPath;
	}

	/**
	 * Real path to Relative path
	 * @param string realPath Entry real path
	 * @return string Relative path
	 */
	static _toRelativePath (realPath) {
		return realPath.substr(ROOT_DIRECTORY.length);
	}
}

module.exports = Entry;
