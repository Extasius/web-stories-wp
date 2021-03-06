<?php
/**
 * Plugin initialization file.
 *
 * @package   Google\Web_Stories
 * @copyright 2020 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/google/web-stories-wp
 */

/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Google\Web_Stories;

/**
 * Handles plugin activation.
 *
 * Throws an error if the site is running on PHP < 5.6
 *
 * @since 1.0.0
 *
 * @param bool $network_wide Whether to activate network-wide.
 *
 * @return void
 */
function activate( $network_wide ) {
	if ( version_compare( PHP_VERSION, WEBSTORIES_MINIMUM_PHP_VERSION, '<' ) ) {
		wp_die(
			/* translators: %s: PHP version number */
			esc_html( sprintf( __( 'Web Stories requires PHP %s or higher.', 'web-stories' ), WEBSTORIES_MINIMUM_PHP_VERSION ) ),
			esc_html__( 'Plugin could not be activated', 'web-stories' )
		);
	}

	do_action( 'web_stories_activation', $network_wide );
}

/**
 * Handles plugin deactivation.
 *
 * @since 1.0.0
 *
 * @param bool $network_wide Whether to deactivate network-wide.
 *
 * @return void
 */
function deactivate( $network_wide ) {
	if ( version_compare( PHP_VERSION, WEBSTORIES_MINIMUM_PHP_VERSION, '<' ) ) {
		return;
	}

	do_action( 'web_stories_deactivation', $network_wide );
}

register_activation_hook( WEBSTORIES_PLUGIN_FILE, '\Google\Web_Stories\activate' );
register_deactivation_hook( WEBSTORIES_PLUGIN_FILE, '\Google\Web_Stories\deactivate' );

$web_stories = new Plugin();
$web_stories->register();
