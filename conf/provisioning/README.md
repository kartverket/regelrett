# Provision Regelrett

Regelrett has an active provisioning system that uses configuration files.
This makes GitOps more natural since data sources and dashboards can be defined using files that can be version controlled.

## Configuration file

Refer to [Configuration](../README.md) for more information on what you can configure in `conf/custom.yaml`.

### Configuration file locations

Regelrett reads its default configuration from `<WORKING DIRECTORY>/conf/defaults.yaml`.
By default, Regelrett reads custom configuration from `<WORKING DIRECTORY>/conf/custom.yaml`.
~~You can override the custom configuration path with the `--config` option.~~

### Use environment variables

You can use environment variable lookups in all provisioning configuration.
The syntax for an environment variable is `$ENV_VAR_NAME`.

<!-- If the environment variable value has a `$` in it (for example, `Pa$sw0rd`), use the `$ENV_VAR_NAME` syntax to avoid double expansion. -->
<!-- You can only use environment variables for configuration values and not for keys or bigger parts of the configuration file structure. -->

You can use environment variables in schema provisioning configuration but not the schema definition files themselves.

The following example looks up the data source URL port, user, and password using environment variables:

```yaml
schema_sources:
  - name: Skjemanavn
    url: http://localhost:$PORT
    user: $USER
    secureJsonData:
      password: $PASSWORD
```

~~To escape a literal `$` in your provisioning file values, use `$$`.~~

## Schema sources

You can manage schema sources in Regelrett by adding YAML configuration files in the [`provisioning/schemasources`](../README.md#provisioning) directory.
Each configuration file contains a list of schema sources, under the `schemasources` key, to add ~~or update~~ during startup.
~~If the schema source already exists, Regelrett reconfigures it to match the provisioned configuration file.~~

<!-- Dette blir relevant om kildene lagres i en database -->
<!-- ~~You can also list schema sources to automatically delete, using the key `deleteschemasources`. -->
<!-- Regelrett deletes the schema sources listed in `deleteschemasources` _before_ adding or updating those in the `schemasources` list.~~ -->
<!---->
<!-- ~~You can configure Regelrett to automatically delete provisioned schema sources when they're removed from the provisioning file. -->
<!-- To do so, add `prune: true` to the root of your schema source provisioning file. -->
<!-- With this configuration, Regelrett also removes the provisioned schema sources if you remove the provisioning file entirely.~~ -->

### Example schema source configuration file

This example provisions a Airtable schema source:

```yaml
schemasources:
  # <string, required> Sets the name you use to refer to
  # the schema source in panels and queries.
  - name: Sikkerhetskontrollere
    # <AIRTABLE | YAML, required> Sets the schema source type.
    type: AIRTABLE
    # <string> Sets a custom UID to reference this
    # schema source in other parts of the configuration.
    # If not specified, Regelrett generates one.
    uid: my_unique_uid
    # <int> Sets the version. Used to compare versions when
    # updating. Ignored when creating a new schema source.
    version: 1
    # <string> Sets the data source's URL, including th
    # port.
    url: "https://api.airtable.com"
    ##### Additional parameters for specifying Airtable schema #####
    ##### sources.                                             #####
    # <string, required, for Airtable schema sources> Specifies
    # the base to which the specified table belongs.
    base_id: unique_base_id
    # <string, required, for Airtable schema sources> Specifies
    # the id to identify the relevant table in requests to the
    # Airtable api.
    table_id: unique_table_id
    # <string, optional, for Airtable schema sources> The name
    # or ID of a view in the table. If set, only the records
    # in that view will be returned.
    view_id: unique_table_id
    # <string, optional, for Airtable schema sources> Specify
    # a webhook id and secret to allow Airtable to notify
    # Regelrett of changes to the data.
    webhook_id: exampleid
    # <string, optional, for Airtable schema sources>
    webhook_secret: S3cr3t!
    ##### Additional parameters for specifying Yaml schema     #####
    ##### sources.                                             #####
    # Either url or resourcePath must be set
    # <string, optional, for Yaml schema sources> Path to a Yaml
    # schema source relative to project resources.
    resource_path: /schemas/schema1
```
